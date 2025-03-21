from decimal import Decimal
from market.models import Asset
from .models import Order
from user.models import Portfolio, PortfolioItem
from rest_framework.exceptions import ValidationError
import redis
import json
from asgiref.sync import sync_to_async
from .tasks import execute_pending_orders_task
from django.core.cache import cache
from django.forms.models import model_to_dict  # type: ignore

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)


def get_market_price(symbol, source):
    key = f"{source}:{symbol}"
    price = redis_client.get(key)
    print('get market function\n the price:', price)
    return float(price) if price else None

class TradeService:

    @staticmethod
    def get_sample_order(id):
        order = Order.objects.get(id=id)
        return order
    
    @staticmethod
    def create_order(data, user_account,target_order=False, noramal_order=True, stop_order=False):
        print('entering create order function line:26')
        product_type = data['product_type']
        order_type = data['order_type']
        asset = Asset.objects.get(id=data['asset_id'])
        trade_type = data['trade_type']
        limit_price = Decimal(data['price']) if order_type == 'limit' else None
        quantity = data['quantity']
        if noramal_order:
            print('normal order(line : 34)')
            order = Order.objects.create(
                user=user_account.user,
                asset=asset,
                account=user_account,
                quantity=quantity,
                limit_price=limit_price,
                price=data['price'],
                trade_type=trade_type,
                order_type=order_type,
                trade_duration=product_type,
                status='pending',
            )
            
            order.save()
            print(order,'printing order')
            return order


    @staticmethod
    def validate_currency(asset, currency):
        print(asset, currency)
        if asset.is_crypto and currency != 'USD':
            raise ValidationError(
                {'error': 'Crypto trades must be placed in USD.'})
        if not asset.is_crypto and currency == 'USD':
            raise ValidationError(
                {'error': 'Stock trades must be placed in stock INR.'})

    @staticmethod
    def check_balance(user_active_account, price, quantity):
        if not user_active_account or not price or not quantity:
            raise ValidationError()
        if user_active_account.get_balance() < price * quantity:
            print('insufficient balance')
            return False
        else:
            return price * quantity

    @staticmethod
    def store_limit_order(order_id, symbol, order_type, limit_price):
        """Store orders in a Redis Sorted Set (ZSET)."""
        key = f"orders:{symbol}:{order_type}"
        print('here i store limit order calling and storing')
        print(key)
        limit_price = float(limit_price)
        redis_client.zadd(key, {json.dumps(
            {"id": order_id, "price": limit_price, "order_type": order_type}): limit_price})
        print(f"Order {order_id} added to {key} at price {limit_price}")

    @staticmethod
    def execute_delivery_order(order, data, user_account):
        # Execute delivery order
        print('enter excute_delivery order function')
        match order.trade_type:
            case 'buy':
                # 1) checking balance
                market_price = get_market_price(order.asset.get_symbol(), order.asset.get_resource())
                price = market_price
                if order.limit_price and order.limit_price < market_price:
                    price = order.limit_price
                amount = TradeService.check_balance(
                    user_account, price, order.quantity)
                if amount is False:
                    order.status = 'rejected'
                    order.save()
                    raise ValidationError({'error': 'Insufficient balance.'})
                
                
                # 2) executing trade & updating balance
                trade_complete = TradeService.buy_order(
                    order, data, user_account, amount)
                if trade_complete == 'executed':
                    user_account.update_balance(amount, action='debit')
                    return True
                elif trade_complete == 'pending':
                    user_account.update_balance(amount, action='debit')
                    return order.status
                if not trade_complete:
                    raise ValidationError({'error': 'Trade failed.'})
                
                return True

            case 'sell':
                print('handling sell order')
                # 1) checking balance
                price = get_market_price(order.asset.get_symbol(), order.asset.get_resource())
                if order.limit_price and order.limit_price > price:
                    price = order.limit_price
                portfolio = Portfolio.objects.get(account=user_account)
                portfolio_item = PortfolioItem.objects.filter(
                    portfolio=portfolio, asset=order.asset).first()
                if portfolio_item is None or portfolio_item.quantity < order.quantity:
                    order.status = 'rejected'
                    order.save()
                    raise ValidationError({'error': 'Insufficient quantity to sell.'})
                # 2) executing trade & updating balance
                amount = price * order.quantity
                trade_complete = TradeService.sell_order(
                    order, data, user_account, amount)
                if not trade_complete:
                    raise ValidationError({'error': 'Trade failed.'})
                if trade_complete == 'executed':
                    user_account.update_balance(amount, action='credit') 
                elif trade_complete == 'pending':
                    print('trade pending')
            case _:
                print('handling default case')

    @staticmethod
    def execute_market_order(order, user_account):

        price = get_market_price(order.asset.get_symbol(), order.asset.get_resource())
        order.price = price
        order.status = 'executed'
        order.save()
        return order

    @staticmethod
    def execute_limit_order(order, user_account):
        price = order.limit_price
        order.price = price
        order.status = 'pending'
        TradeService.store_limit_order(order.id, order.asset.get_symbol(), order.trade_type, order.limit_price)
        order.save()
        return order
        
    @staticmethod
    def buy_order(order, data, user_account, amount):
        # 1) Checking market order or limit order
        if order.order_type == 'market':
            executed = TradeService.execute_market_order(order, user_account)
            if not executed:
                raise ValidationError({'error': 'Trade failed.'})
            return order.status
        elif order.order_type == 'limit':
            if order.limit_price >= get_market_price(order.asset.get_symbol(), order.asset.get_resource()):
                executed = TradeService.execute_market_order(order, user_account)
                if not executed:
                    raise ValidationError({'error': 'Trade failed.'})
                return order.status
            else:
                executing = TradeService.execute_limit_order(order, user_account)
                if not executing:
                    raise ValidationError({'error': 'Trade failed.'})
                return order.status
        
    @staticmethod
    def sell_order(order, data, user_account, amount):
        
        if order.order_type == 'market':
            print('market order')
            executed = TradeService.execute_market_order(order, user_account)
            if not executed:
                raise ValidationError({'error': 'Trade failed.'})
            return order.status
        elif order.order_type == 'limit':
            if order.limit_price <= get_market_price(order.asset.get_symbol(), order.asset.get_resource()):
                executed = TradeService.execute_market_order(order, user_account)
                if not executed:
                    raise ValidationError({'error': 'Trade failed.'})
                return True
            else:
                executing = TradeService.execute_limit_order(order, user_account)  
                if not executing:
                    raise ValidationError({'error': 'Trade failed.'})
                return order.status
            
    @staticmethod
    def execute_limit_orders(symbol, price):

        buy_key = f"orders:{symbol}:buy"
        sell_key = f"orders:{symbol}:sell"

        # Find all BUY orders where price >= new price (buyers want lower price)
        buy_orders = redis_client.zrangebyscore(buy_key, price, "+inf")
        buy_order_ids = [json.loads(order)['id'] for order in buy_orders]
        orders = redis_client.zrange(buy_key, 0, -1, withscores=True)
        # Find all SELL orders where price <= new price (sellers want higher price)
        sell_orders = redis_client.zrangebyscore(sell_key, "-inf", price)
        sell_order_ids = [json.loads(order)['id'] for order in sell_orders]
        # Execute BUY orders asynchronously
        if buy_order_ids:
            execute_pending_orders_task.delay(buy_order_ids, price, buy_key)

        # Execute SELL orders asynchronously
        if sell_order_ids:
            execute_pending_orders_task.delay(sell_order_ids, price, sell_key)

        return f"Processed {len(buy_order_ids)} buy orders & {len(sell_order_ids)} sell orders"

    @staticmethod
    def excute_order(data, user_account):
        print('entered excute order function')
        order = TradeService.create_order(data, user_account)
        print('order created')
        
        if order.trade_duration == 'delivery':
            TradeService.execute_delivery_order(order, data, user_account)

    @staticmethod
    async def excute_pending_orders(order_id, price, trade_type):
        try:
            order = await sync_to_async(Order.objects.get(id=order_id))
            print('order', order)
            order.status = 'executed'
            order.price = price
            order.save()
            print('completed order setup completed')
        except Order.DoesNotExist:
            print('Order not found')
            return 'Order not found'


class OrderService:

    @staticmethod
    def get_orders(user_account):
        orders = Order.objects.filter(account=user_account)
        return orders

    @staticmethod
    def get_order(order_id, user_account):
        order = Order.objects.get(id=order_id, account=user_account)
        return order

    @staticmethod
    def cancel_order(order_id, user_account):
        order = Order.objects.get(id=order_id, account=user_account)
        if order.status == 'pending':
            order.status = 'cancelled'
            order.save()
            return 'Order cancelled successfully.'
        else:
            return 'Order cannot be cancelled.'








