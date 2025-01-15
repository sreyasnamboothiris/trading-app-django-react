from django.db import models


class Asset(models.Model):
    ASSET_TYPE_CHOICES = [
        ('index', 'Index'),
        ('stock', 'Stock'),
        ('crypto', 'Crypto')
    ]

    asset_name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    is_crypto = models.BooleanField(default=False)
    tradingview_symbol = models.CharField(max_length=50)
    yfinance_symbol = models.CharField(max_length=50,null=True,blank=True)
    last_traded_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.asset_name
