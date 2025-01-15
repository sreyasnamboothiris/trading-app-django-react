from rest_framework import serializers
from .models import Asset

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'asset_name', 'asset_type', 'tradingview_symbol', 'yfinance_symbol', 'last_traded_price']
