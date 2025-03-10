from django.shortcuts import render
from rest_framework import status, generics
from django_redis import get_redis_connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from market.models import Asset
from .serializers import OrderSerializer
from .services import TradeService, OrderService
from .models import Order

# Test View with JWT Authentication


class TradeTestApiView(generics.ListCreateAPIView):

    permission_classes = [AllowAny]

    def get_queryset(self):
        # Return orders for the current authenticated user.
        print('helle')

    def post(self, request, *args, **kwargs):  # Add request parameter
        user_active_account = request.user.get_user_acitve_account()
        data = request.data
        user_active_account.get_currency()

        TradeService.excute_order(data=data, user_account=user_active_account)

        return Response({"message": "Trade request received"}, status=200)


class OrderView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        print('msg vannu')
        user_active_account = request.user.get_user_acitve_account()
        orders = Order.objects.filter(account=user_active_account).order_by('-created_at')

        if orders:
            
            self.store_pending_orders_in_redis(orders)
            serialized_orders = OrderSerializer(orders, many=True).data
            return Response({'orders': serialized_orders}, status=200)
        else:
            return Response({'message': 'No orders found'}, status=404)

    def store_pending_orders_in_redis(self, orders):
        """Store pending limit orders in Redis if they don't already exist."""
        redis_client = get_redis_connection("default")
        print('redis client', redis_client)
        for order in orders:
            if order.status == "pending" and order.order_type == "limit":
                key = f"orders:{order.asset.symbol}:{order.trade_type}"
                
                print('key', key)
                # Check if order already exists in Redis
                existing_orders = redis_client.zrangebyscore(key, float(order.limit_price), float(order.limit_price))

                if existing_orders:
                    print(f"Order {order.id} already exists in Redis, skipping.")
                    continue  # Skip storing if already exists

                # Store in Redis
                #TradeService.store_limit_order(order.id, order.asset.symbol, order.trade_type, float(order.limit_price))

                #print(f"Stored Order {order.id} in Redis.")
