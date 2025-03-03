
from market.models import Asset
from .models import Order
from rest_framework.exceptions import ValidationError
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379,
                           db=0, decode_responses=True)


def get_maret_price(symbol, source):
    key = f"{source}:{symbol}"
    price = redis_client.get(key)
    return float(price) if price else None


class TradeService:

    @staticmethod
    def balance_update(user_account, amount, action='debit'):
        if action == 'credit':
            user_account.funds = user_account.balance + amount
        else:
            user_account.funds = user_account.balance - amount
        
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
                    return 'here we handle the limit order concept'
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
            trade_type=product_type,
            status='excuted',
        )
        
        TradeService.balance_update(user_account, float(data['price']) * float(data['quantity']))
        TradeService.validate_currency(asset, user_account.get_currency().code)
        TradeService.check_balance(user_account, float(data['price']), float(data['quantity']))
        
