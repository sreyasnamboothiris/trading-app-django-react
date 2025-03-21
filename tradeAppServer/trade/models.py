import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from user.models import CustomUser,Account, Portfolio, PortfolioItem  # User Model
from market.models import Asset  # Stocks, Crypto, etc.
from decimal import Decimal


class Order(models.Model):
    """ Handles Market, Limit, Stop-Loss, and Target Orders """

    TRADE_TYPES = (('buy', 'Buy'), ('sell', 'Sell'))

    ORDER_TYPES = (
        ('market', 'Market Order'),
        ('limit', 'Limit Order'),
        ('stoploss_market', 'Stop-Loss Market Order'),
        ('stoploss_limit', 'Stop-Loss Limit Order'),
        ('target_market', 'Target Market Order'),
        ('target_limit', 'Target Limit Order')
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('executed', 'Executed'),
        ('cancelled', 'Cancelled'),
        ('triggered', 'Triggered'),
        ('rejected', 'Rejected')
    )
    TRADE_DURATION = (
        ('intraday', 'Intraday'),
        ('longterm', 'Long-Term'),
        ('delivery', 'Delivery')
    )

    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    trade_type = models.CharField(max_length=12, choices=TRADE_TYPES)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPES)
    quantity = models.PositiveIntegerField()
    trade_duration = models.CharField(max_length=10, choices=TRADE_DURATION, default='longterm')
    
    limit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For Limit Orders
    trigger_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For Stop-Loss & Target
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    # Self-referencing relationships for Stop-Loss & Target orders
    linked_stoploss = models.OneToOneField('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='main_order_stoploss')
    linked_target = models.OneToOneField('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='main_order_target')

    def clean(self):
        """ Validation for order placement """

        if self.quantity <= 0:
            raise ValidationError("Quantity must be greater than zero.")

        if self.order_type in ['limit', 'stoploss_limit', 'target_limit'] and not self.limit_price:
            raise ValidationError(f"{self.order_type.capitalize()} Order must have a limit price.")

        if self.order_type in ['stoploss_market', 'stoploss_limit', 'target_market', 'target_limit'] and not self.trigger_price:
            raise ValidationError(f"{self.order_type.capitalize()} Order must have a trigger price.")

    def execute_trigger(self):
        """ Converts Stop-Loss/Target order into Market or Limit Order when triggered """
        if self.status == 'pending':
            if self.order_type in ['stoploss_market', 'stoploss_limit', 'target_market', 'target_limit']:
                if 'market' in self.order_type:
                    self.order_type = 'market'
                elif 'limit' in self.order_type:
                    self.order_type = 'limit'

                self.status = 'triggered'
                self.save()

                # Cancel the other order (OCO mechanism)
                if self.main_order_stoploss and self.main_order_stoploss.status == 'pending':
                    self.main_order_stoploss.status = 'cancelled'
                    self.main_order_stoploss.save()

                if self.main_order_target and self.main_order_target.status == 'pending':
                    self.main_order_target.status = 'cancelled'
                    self.main_order_target.save()

                return f"{self.order_type.capitalize()} order triggered."

    

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

        if self.status == 'executed' and (self.trade_duration in ['delivery', 'longterm']):
            portfolio,_ = Portfolio.objects.get_or_create(user=self.user, account = self.account)
            if self.trade_type == "buy":
            # Check if asset already exists in portfolio
                portfolio_item, created = PortfolioItem.objects.get_or_create(
                    portfolio=portfolio,
                    asset=self.asset,
                    defaults={'quantity': Decimal(0), 'average_price': self.price}
                )
                print('portfolio_item \n here is the thing \n ',portfolio_item)
                # Update quantity and average price
                if not created:
                    new_quantity = portfolio_item.quantity + self.quantity
                    new_average_price = ((portfolio_item.quantity * portfolio_item.average_price) + 
                                        (self.quantity * Decimal(self.price))) / new_quantity

                    portfolio_item.quantity = new_quantity
                    portfolio_item.average_price = new_average_price
                else:
                    portfolio_item.quantity = self.quantity
                    portfolio_item.average_price = self.price
                
                portfolio_item.save()

            elif self.trade_type == "sell":
                try:
                    portfolio_item = PortfolioItem.objects.get(portfolio=portfolio, asset=self.asset)

                    if portfolio_item.quantity >= self.quantity:
                        portfolio_item.quantity -= self.quantity
                        if portfolio_item.quantity == 0:
                            portfolio_item.delete()  # Remove if all shares are sold
                        else:
                            portfolio_item.save()
                        portfolio.account.update_balance(self.quantity * self.price, action='credit')
                        
                    else:
                        raise ValidationError("Not enough quantity in portfolio to sell.")

                except PortfolioItem.DoesNotExist:
                    raise ValidationError("No holdings found in portfolio for this asset.")
            
        
