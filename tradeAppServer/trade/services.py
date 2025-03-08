
from decimal import Decimal
from market.models import Asset
from .models import Order
from rest_framework.exceptions import ValidationError
import redis
import json
from asgiref.sync import sync_to_async
from .tasks import execute_pending_orders_task
from django.core.cache import cache

redis_client = redis.Redis(host='localhost', port=6379,
                           db=0, decode_responses=True)


def get_maret_price(symbol, source):
    key = f"{source}:{symbol}"
    price = redis_client.get(key)
    return float(price) if price else None


class TradeService:

    @staticmethod
    def balance_update(user_account, amount, action='debit'):
        amount = Decimal(str(amount))
        if action == 'credit':
            user_account.funds = user_account.funds + amount
        else:
            user_account.funds = user_account.funds - amount
        
        user_account.save()

    @staticmethod
    def validate_currency(asset, currency):
        print(asset,currency)
        if asset.is_crypto and currency != 'USD':
            raise ValidationError({'error':'Crypto trades must be placed in USD.'})
        if not asset.is_crypto and currency == 'USD':
            raise ValidationError({'error':'Stock trades must be placed in stock INR.'})

    @staticmethod
    def check_balance(user_active_account, price, quantity):
        if user_active_account.get_balance() < price * quantity:
            raise ValidationError({'error': 'Insufficient balance.'})
        else:
            return price * quantity

    @staticmethod
    def store_limit_order(order_id, symbol, order_type, limit_price):
        """Store orders in a Redis Sorted Set (ZSET)."""
        key = f"orders:{symbol}:{order_type}"
        print(key)
        redis_client.zadd(key, {json.dumps({"id": order_id, "price": limit_price,"order_type":order_type}): limit_price})
        print(f"Order {order_id} added to {key} at price {limit_price}")
    
        
    @staticmethod
    def execute_limit_orders(symbol, price):

        buy_key = f"orders:{symbol}:buy"
        sell_key = f"orders:{symbol}:sell"

        # Find all BUY orders where price >= new price (buyers want lower price)
        buy_orders = redis_client.zrangebyscore(buy_key, price, "+inf")
        buy_order_ids = [json.loads(order)['id'] for order in buy_orders]
        print('hellow',buy_orders)
        orders = redis_client.zrange(buy_key, 0, -1, withscores=True)
        print("Stored Orders in Redis:", orders)
        # Find all SELL orders where price <= new price (sellers want higher price)
        sell_orders = redis_client.zrangebyscore(sell_key, "-inf", price)
        sell_order_ids = [json.loads(order)['id'] for order in sell_orders]
        # Execute BUY orders asynchronously
        if buy_order_ids:
            execute_pending_orders_task.delay(buy_order_ids, price, buy_key)

        # Execute SELL orders asynchronously
        if sell_order_ids:
            execute_pending_orders_task.delay(sell_order_ids, price, sell_key)
        

        # # Execute sell orders in bulk (if any)
        # if sell_order_ids:
        #     print(f"🔹 Executing {len(sell_order_ids)} SELL orders at price {price}")
        #     execute_pending_orders_task.delay(sell_order_ids, price)  # Async execution
        
        return f"Processed {len(buy_order_ids)} buy orders & {len(sell_order_ids)} sell orders"
            

    
    @staticmethod
    def excute_order(data, user_account):

        product_type = data['product_type']
        order_type = data['order_type']
        asset = Asset.objects.get(id=data['asset_id'])
        trade_type = data['trade_type']
        
        if order_type == 'market':
            
            data['price'] = get_maret_price(asset.symbol, asset.get_resource())
        elif order_type == 'limit':
            if trade_type == 'buy':
                if get_maret_price(asset.symbol, asset.get_resource()) < float(data['price']):
                    data['price'] = get_maret_price(asset.symbol, asset.get_resource())
                else:
                    print('here we handle the limit order concept',data['price'])
                    order = Order.objects.create(
                        user=user_account.user,
                        asset=asset,
                        account=user_account,
                        order_type=order_type,
                        quantity=int(data['quantity']),
                        limit_price=float(data['price']),
                        trade_duration=product_type,
                        trade_type=trade_type,
                        status='pending',
                    )
                    order.save()
                    TradeService.store_limit_order(order.id,asset.symbol, trade_type, order.limit_price)
                    return 
            elif trade_type == 'sell':
                if get_maret_price(asset.symbol, asset.get_resource()) > float(data['price']): 
                    data['price'] = get_maret_price(asset.symbol, asset.get_resource())
                else:
                    
                    
                    return 'here we handle the limit order concept'

        Order.objects.create(
            user=user_account.user,
            asset=asset,
            account=user_account,
            order_type=order_type,
            quantity=int(data['quantity']),
            price=float(data['price']),
            trade_duration=product_type,
            trade_type=trade_type,
            status='executed',
        )
        
        TradeService.balance_update(user_account, float(data['price']) * float(data['quantity']))
        TradeService.validate_currency(asset, user_account.get_currency().code)
        TradeService.check_balance(user_account, float(data['price']), float(data['quantity']))

    @staticmethod
    async def excute_pending_orders(order_id, price, trade_type):
        try:
            order = await sync_to_async(Order.objects.get(id=order_id)) 
            print('order',order)
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