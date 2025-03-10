from rest_framework import serializers
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'asset_type', 'tradingview_symbol',
                  'last_traded_price', 'percent_change', 'net_change','smart_api_token']
