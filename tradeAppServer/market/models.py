from django.db import models


class Asset(models.Model):
    ASSET_TYPE_CHOICES = [
        ('index', 'Index'),
        ('stock', 'Stock'),
        ('crypto', 'Crypto')
    ]

    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    is_crypto = models.BooleanField(default=False)
    symbol = models.CharField(max_length=50,null=True,blank=True)
    tradingview_symbol = models.CharField(max_length=50,null=True,blank=True)
    last_traded_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    percent_change = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    net_change = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    smart_api_token = models.CharField(max_length=50,null=True,blank=True)

    def __str__(self):
        return f"{self.name} - {self.symbol}"

    def get_symbol(self):
        return self.symbol

    def get_resource(self):

        if self.is_crypto:
            return "binance"
        else:
            return "smartapi"
