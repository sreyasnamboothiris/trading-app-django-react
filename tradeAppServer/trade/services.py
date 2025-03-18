
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

redis_client = redis.Redis(host='localhost', port=6379,
                           db=0, decode_responses=True)


def get_or_create_portfolio(user, account=None):
    """Get an existing portfolio or create a new one for the user and account."""
    portfolio, created = Portfolio.objects.get_or_create(
        user=user, account=account)
    return portfolio


def add_or_update_portfolio_item(user, asset, quantity, price, account=None):
    """
    Add an asset to the portfolio or update an existing item.
    Also updates the portfolio’s total investment and current value.
    """
    portfolio = get_or_create_portfolio(user, account)

    # Get or create a PortfolioItem
    portfolio_item, created = PortfolioItem.objects.get_or_create(
        portfolio=portfolio,
        asset=asset,
        defaults={'quantity': quantity, 'average_price': price}
    )

    # If the item already exists, update quantity and average price
    if not created:
        total_cost = (portfolio_item.quantity *
                      portfolio_item.buy_price) + (quantity * price)
        total_quantity = portfolio_item.quantity + quantity
        portfolio_item.buy_price = total_cost / total_quantity  # Weighted average price
        portfolio_item.quantity = total_quantity

    portfolio_item.save()

    # Update the portfolio after adding/updating the item
    portfolio.update_portfolio()

    return portfolio_item


def get_market_price(symbol, source):
    key = f"{source}:{symbol}"
    price = redis_client.get(key)
    print('get market function\n the price:', price)
    return float(price) if price else None


class TradeService:

    @staticmethod
    def create_order(data, user_account):
        order = Order.object.create(
            user=user_account.user,
            asset=Asset.objects.get(id=data['asset_id']),
            account=user_account,
            quantity=data['quantity'],
            price=data['price'],
            trade_type=data['trade_type'],
            order_type=data['order_type'],
            trade_duration=data['product_type'],
            status='pending',
        )
        order.save()
        return order

    @staticmethod
    def update_portfolio(user, asset, quantity, price, user_account, trade_type):
        """Updates the portfolio based on buy/sell transactions."""
        quantity = Decimal(str(quantity))
        price = Decimal(str(price))
        # Get or create the portfolio
        portfolio, created = Portfolio.objects.get_or_create(
            user=user, account=user_account, defaults={'name': 'Default Portfolio'})

        # Get existing portfolio item
        portfolio_item = PortfolioItem.objects.filter(
            portfolio=portfolio, asset=asset).first()

        if trade_type == 'buy':
            if portfolio_item:
                # Update existing asset - Adjust quantity & average price
                total_quantity = portfolio_item.quantity + quantity
                new_avg_price = (
                    (portfolio_item.quantity * portfolio_item.average_price) + (quantity * price)) / total_quantity

                portfolio_item.quantity = total_quantity
                portfolio_item.average_price = new_avg_price
                portfolio_item.save()

                print(
                    f"Updated {portfolio_item.asset.name} in {portfolio.portfolio_name}: {total_quantity} units at ${new_avg_price:.2f} avg price")

            else:
                # Create new PortfolioItem
                PortfolioItem.objects.create(
                    portfolio=portfolio,
                    asset=asset,
                    quantity=quantity,
                    average_price=price
                )
                print(
                    f"Added {quantity} units of {asset.name} to {portfolio.name} at ${price:.2f} avg price")

        elif trade_type == 'sell':
            if not portfolio_item or portfolio_item.quantity < quantity:
                raise ValidationError(
                    {'error': 'Insufficient quantity to sell.'})

            # Reduce quantity
            portfolio_item.quantity -= quantity

            if portfolio_item.quantity == 0:
                portfolio_item.delete()  # Remove asset from portfolio
                print(f"Sold all {asset.name}, removed from {portfolio.name}")
            else:
                portfolio_item.save()
                print(
                    f"Sold {quantity} units of {asset.name}, remaining {portfolio_item.quantity} in {portfolio.name}")
        items = portfolio.items.all()
        # Sum all item investments
        total_investment = sum(item.total_investment for item in items)
        # Sum all item values
        current_value = sum(item.current_value() for item in items)

        portfolio.total_investment = total_investment
        portfolio.current_value = current_value
        portfolio.save(update_fields=["total_investment", "current_value"])
        portfolio.update_portfolio()

        # Update weightage for each PortfolioItem
        for item in items:
            if total_investment > 0:
                item.weightage = (item.total_investment /
                                  total_investment) * 100
            else:
                item.weightage = 0
            item.save(update_fields=["weightage"])

        return True

    @staticmethod
    def balance_update(user_account, amount, action='debit'):
        amount = Decimal(str(amount)).quantize(Decimal('0.01')) 
        if action == 'credit':
            user_account.funds = user_account.funds + amount
        else:
            user_account.funds = user_account.funds - amount

        user_account.save()

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
            print('some none values in the checkblance')
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
        print(key)
        redis_client.zadd(key, {json.dumps(
            {"id": order_id, "price": limit_price, "order_type": order_type}): limit_price})
        print(f"Order {order_id} added to {key} at price {limit_price}")

    @staticmethod
    def execute_delivery_order(order, data, user_account):
        # Execute delivery order

        match order.trade_type:
            case 'buy':
                print('handling buy order')
                # 1) checking balance
                price = order.limit_price if order.limit_price else get_market_price(
                    order.asset.get_symbol(), order.asset.get_resource())
                amount = TradeService.check_balance(
                    user_account, price, order.quantity)
                print(amount,'here i am printing amount')
                if amount is False:
                    order.status = 'rejected'
                    order.save()
                    raise ValidationError({'error': 'Insufficient balance.'})
                # 2) executing trade & updating balance
                trade_complete = TradeService.buy_order(
                    order, data, user_account, amount)
                if not trade_complete:
                    raise ValidationError({'error': 'Trade failed.'})
                TradeService.balance_update(
                    user_account, amount, action='debit')
                order.save()
                return True

            case 'sell':
                print('handling sell order')
            case _:
                print('handling default case')

    @staticmethod
    def execute_market_order(order, user_account):

        price = get_market_price(
            order.asset.get_symbol(), order.asset.get_resource())
        order.price = price
        order.status = 'executed'
        order.save()
        return True

    @staticmethod
    def execute_limit_order(data, user_account):
        pass

    @staticmethod
    def buy_order(order, data, user_account, amount):
        print('entering buy order\n', order, data, user_account)
        # 1) Checking market order or limit order
        if order.order_type == 'market':
            print('market order')
            executed = TradeService.execute_market_order(order, user_account)
            if not executed:
                raise ValidationError({'error': 'Trade failed.'})
            TradeService.update_portfolio(
                user_account.user, order.asset, order.quantity, order.price, user_account, 'buy')   # Update portfolio

            return True
        elif order.trade_type == 'limit':
            TradeService.execute_limit_order(order, user_account)

        TradeService.balance_update(user_account, amount, action='debit')
        order.save()
        return True

    @staticmethod
    def sell_order(data, user_account):
        pass

    @staticmethod
    def execute_limit_orders(symbol, price):

        buy_key = f"orders:{symbol}:buy"
        sell_key = f"orders:{symbol}:sell"

        # Find all BUY orders where price >= new price (buyers want lower price)
        buy_orders = redis_client.zrangebyscore(buy_key, price, "+inf")
        buy_order_ids = [json.loads(order)['id'] for order in buy_orders]
        print('hellow', buy_orders)
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
        order = Order.objects.create(
            user=user_account.user,
            asset=asset,
            account=user_account,
            order_type=order_type,
            quantity=int(data['quantity']),
            trade_duration=product_type,
            trade_type=trade_type,
            status='pending',
        )
        print(model_to_dict(order))
        if order.trade_duration == 'delivery':
            TradeService.execute_delivery_order(order, data, user_account)

        # if order_type == 'market':

        #     data['price'] = get_maret_price(asset.symbol, asset.get_resource())
        # elif order_type == 'limit':
        #     if trade_type == 'buy':
        #         if get_maret_price(asset.symbol, asset.get_resource()) < float(data['price']):
        #             data['price'] = get_maret_price(asset.symbol, asset.get_resource())
        #         else:
        #             print('here we handle the limit order concept',data['price'])
        #             order = Order.objects.create(
        #                 user=user_account.user,
        #                 asset=asset,
        #                 account=user_account,
        #                 order_type=order_type,
        #                 quantity=int(data['quantity']),
        #                 limit_price=float(data['price']),
        #                 trade_duration=product_type,
        #                 trade_type=trade_type,
        #                 status='pending',
        #             )
        #             order.save()
        #             TradeService.store_limit_order(order.id,asset.symbol, trade_type, order.limit_price)
        #             return
        #     elif trade_type == 'sell':
        #         if get_maret_price(asset.symbol, asset.get_resource()) > float(data['price']):
        #             data['price'] = get_maret_price(asset.symbol, asset.get_resource())
        #         else:

        #             return 'here we handle the limit order concept'

        # Order.objects.create(
        #     user=user_account.user,
        #     asset=asset,
        #     account=user_account,
        #     order_type=order_type,
        #     quantity=int(data['quantity']),
        #     price=float(data['price']),
        #     trade_duration=product_type,
        #     trade_type=trade_type,
        #     status='executed',
        # )

        # TradeService.balance_update(user_account, float(data['price']) * float(data['quantity']))
        # TradeService.validate_currency(asset, user_account.get_currency().code)
        # TradeService.check_balance(user_account, float(data['price']), float(data['quantity']))

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
