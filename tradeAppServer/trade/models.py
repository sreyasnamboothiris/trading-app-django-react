from django.db import models
from user.models import CustomUser
from market.models import Asset
# Create your models here.

class Order(models.Model):

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

    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    stop_loss = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    target_price = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=False)
    stop_loss_trigger = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    

    def __str__(self):
        return f"{self.user.username} - {self.asset.symbol} - {self.status}"


class Portfolio(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    average_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username}'s Portfolio - {self.asset.symbol}"