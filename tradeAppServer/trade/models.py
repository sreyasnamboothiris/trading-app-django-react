import uuid
from django.db import models
from django.core.exceptions import ValidationError
from user.models import CustomUser
from market.models import Asset
from django.utils.timezone import now
import pytz

class BaseOrder(models.Model):
    """ Abstract base model for common order fields """
    
    TRADE_TYPES = (
        ('buy', 'Buy'),
        ('sell', 'Sell')
    )
    
    ORDER_TYPES = (
        ('longterm', 'Long-Term'),
        ('intraday', 'Intraday')
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('executed', 'Executed'),
        ('cancelled', 'Cancelled'),
        ('open', 'Open')
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    trade_type = models.CharField(max_length=4, choices=TRADE_TYPES)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True  # This makes it an abstract model (no separate table)

    def __str__(self):
        return f"{self.user.username} - {self.asset.symbol} - {self.status}"

    def clean(self):
        """ Validation logic for all orders """
        if self.quantity <= 0:
            raise ValidationError("Quantity must be greater than zero.")
        
        # Check active account
        active_account = self.user.get_active_account()
        if not active_account:
            raise ValidationError("User does not have an active account.")

        total_order_cost = self.quantity * self.price
        if self.trade_type == 'buy' and total_order_cost > active_account.funds:
            raise ValidationError("Insufficient funds in the active account.")

        # Market timing validation (for non-crypto assets)
        if not self.asset.is_crypto:
            ist = pytz.timezone('Asia/Kolkata')
            current_time = now().astimezone(ist)
            market_open = current_time.replace(hour=9, minute=15, second=0, microsecond=0)
            market_close = current_time.replace(hour=15, minute=30, second=0, microsecond=0)

            if current_time.weekday() in (5, 6) or not (market_open <= current_time <= market_close):
                raise ValidationError("Market is closed. Orders can only be placed Monday to Friday, 9:15 AM - 3:30 PM IST.")

    def save(self, *args, **kwargs):
        """ Run clean() before saving the order. """
        self.clean()
        super().save(*args, **kwargs)


class RegularOrder(BaseOrder):
    """ Normal buy/sell order without Stop-Loss or Target """
    pass


class StopLossOrder(BaseOrder):
    """ Stop-Loss order with trigger price """
    
    stop_loss = models.DecimalField(max_digits=10, decimal_places=2)
    stop_loss_trigger = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        super().clean()

        if self.trade_type == 'sell' and self.stop_loss <= self.price:
            raise ValidationError("For Sell orders, Stop-Loss should be higher than the current price.")
        
        if self.trade_type == 'buy' and self.stop_loss >= self.price:
            raise ValidationError("For Buy orders, Stop-Loss should be lower than the current price.")


class TargetOrder(BaseOrder):
    """ Target order with a target price """

    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    target_price_trigger = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        super().clean()

        if self.trade_type == 'sell' and self.target_price >= self.price:
            raise ValidationError("For Sell orders, Target Price should be lower than the current price.")
        
        if self.trade_type == 'buy' and self.target_price <= self.price:
            raise ValidationError("For Buy orders, Target Price should be higher than the current price.")


class CombinedOrder(BaseOrder):
    """ Combined Order with references to Stop-Loss and Target Orders """

    stop_loss_order = models.OneToOneField(
        StopLossOrder, on_delete=models.CASCADE, null=True, blank=True, related_name="combined_order"
    )
    target_order = models.OneToOneField(
        TargetOrder, on_delete=models.CASCADE, null=True, blank=True, related_name="combined_order"
    )

    def clean(self):
        super().clean()

        if not self.stop_loss_order and not self.target_order:
            raise ValidationError("A Combined Order must have at least a Stop-Loss or Target Order.")

        if self.stop_loss_order and self.target_order:
            if self.stop_loss_order.stop_loss_trigger >= self.target_order.target_price_trigger:
                raise ValidationError("Stop-Loss Trigger Price should be lower than Target Trigger Price.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def cancel_stop_loss_if_target_hit(self):
        """ Cancel the Stop-Loss order if the Target is reached """
        if self.target_order and self.target_order.status == "executed":
            if self.stop_loss_order:
                self.stop_loss_order.status = "cancelled"
                self.stop_loss_order.save()
                return "Stop-Loss order cancelled since Target was hit."

        return "No action required."



