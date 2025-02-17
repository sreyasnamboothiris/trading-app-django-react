from rest_framework import serializers
from .models import Order
from market.models import Asset


class OrderSerializer(serializers.ModelSerializer):

    asset_id = serializers.IntegerField(write_only=True)
    class Meta:
        model = Order
        fields = [
            'order_type',
            'trade_type',
            'quantity',
            'price',
            'stop_loss',
            'stop_loss_trigger',
            'target_price',
            'target_price_trigger',
            'asset_id',
        ]
    
    def validate_order_type(self, value):
        """
        Convert the incoming product type ("Intraday" or "Delivery")
        to the model’s expected values ("intraday" or "longterm").
        """
        value_lower = value.lower()
        if value_lower == "intraday":
            return "intraday"
        elif value_lower == "delivery":
            return "longterm"
        raise serializers.ValidationError("order_type must be either 'Intraday' or 'Delivery'.")

    def validate_trade_type(self, value):
        """
        Ensure trade_type is either 'buy' or 'sell' (in lowercase).
        """
        value_lower = value.lower()
        if value_lower in ["buy", "sell"]:
            return value_lower
        raise serializers.ValidationError("trade_type must be either 'Buy' or 'Sell'.")

    def create(self, validated_data):
        # Remove asset_id from the validated data and look up the asset.
        asset_id = validated_data.pop("asset_id")
        try:
            asset = Asset.objects.get(id=asset_id)
        except Asset.DoesNotExist:
            raise serializers.ValidationError({"asset_id": "Asset not found."})
        
        # Get the user from the request context.
        user = self.context["request"].user
        
        # Create the Order instance. Calling full_clean() will run model validations.
        order = Order(user=user, asset=asset, **validated_data)
        order.full_clean()
        order.save()
        return order
