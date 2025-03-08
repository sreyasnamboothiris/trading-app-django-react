from rest_framework import serializers
from .models import Order
from market.serializers import AssetSerializer

class OrderSerializer(serializers.ModelSerializer):

    asset = AssetSerializer()  # ✅ Nested serializer for the Asset model
    class Meta:
        model = Order
        fields = '__all__'  # ✅ Includes all fields from the Order model
