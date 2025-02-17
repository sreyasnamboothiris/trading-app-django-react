import uuid
from django.db import models
from django.core.exceptions import ValidationError
from user.models import CustomUser
from market.models import Asset
from django.utils.timezone import now

import pytz
# Create your models here.

class Order(models.Model):
    
    ORDER_SETUP = (
        ('stoploss','Stop-Loss'),
        ('target','Target')
    )
    ORDER_TYPES = (
        ('longterm','Long-Term'),
        ('intraday','Intraday')
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('executed', 'Executed'),
        ('cancelled', 'Cancelled'),
        ('open','Open')
    )
    TRADE_TYPES = (
            ('buy','Buy'),
            ('sell','Sell')
        )
    
    
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    trade_type = models.CharField(max_length=4, choices=TRADE_TYPES)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    stop_loss = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    target_price = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    stop_loss_trigger = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    target_price_trigger = models.DecimalField(max_digits=10, decimal_places=2,blank=True,null=True)
    

    def __str__(self):
        return f"{self.user.username} - {self.asset.symbol} - {self.status}"

    def clean(self):
        active_account = self.user.get_active_account()
        if not active_account:
            raise ValidationError("User does not have an active account.")

        total_order_cost = self.quantity * self.price
        
        if self.trade_type == 'buy' and total_order_cost > active_account.funds:
            raise ValidationError("Insufficient funds in the active account.")
        
        """ Validate market hours only if the asset is NOT a cryptocurrency. """
        if not self.asset.is_crypto:
            ist = pytz.timezone('Asia/Kolkata')
            current_time = now().astimezone(ist)

            # Market open time: 9:15 AM
            market_open = current_time.replace(hour=9, minute=15, second=0, microsecond=0)
            market_close = current_time.replace(hour=15, minute=30, second=0, microsecond=0)

            # Check if the market is closed (weekends or outside market hours)
            if current_time.weekday() in (5, 6) or not (market_open <= current_time <= market_close):
                raise ValidationError("Market is closed. Orders can only be placed Monday to Friday, 9:15 AM - 3:30 PM IST.")

        # Stop-Loss & Target Price Validation
        if self.trade_type and self.asset:
            current_buy_price = self.price  # Assuming `current_price` is a field in Asset model

            if self.trade_type == 'sell':
                if self.stop_loss and self.stop_loss <= current_buy_price:
                    raise ValidationError("For Sell orders, Stop-Loss should be higher than the current buy price.")
                if self.target_price and self.target_price >= current_buy_price:
                    raise ValidationError("For Sell orders, Target Price should be lower than the current buy price.")

            elif self.trade_type == 'buy':
                if self.stop_loss and self.stop_loss >= current_buy_price:
                    raise ValidationError("For Buy orders, Stop-Loss should be lower than the current buy price.")
                if self.target_price and self.target_price <= current_buy_price:
                    raise ValidationError("For Buy orders, Target Price should be higher than the current buy price.")

        # Trigger Price Validation
        if self.stop_loss_trigger and self.price and self.target_price:
            if self.trade_type == 'buy':
                if not (self.price < self.stop_loss_trigger <= self.target_price):
                    raise ValidationError("For Buy orders, Trigger Price should be greater than the order price and not exceed the target price.")

            elif self.trade_type == 'sell':
                if not (self.target_price <= self.stop_loss_trigger < self.price):
                    raise ValidationError("For Sell orders, Trigger Price should be less than the order price and not lower than the target price.")
        if self.quantity <= 0:
            raise ValidationError("Quantity must be greater than zero.")
    def save(self, *args, **kwargs):
        """ Run clean() before saving the order. """
        self.clean()
        super().save(*args, **kwargs)


class Portfolio(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    average_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username}'s Portfolio - {self.asset.symbol}"





