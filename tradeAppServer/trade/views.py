from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from market.models import Asset
from .serializers import OrderSerializer
from .services import TradeService, OrderService

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
        orders = OrderService.get_orders(user_active_account).order_by('-created_at')
        print(orders, 'ordres\n this is the order')
        if orders:
            serialized_orders = OrderSerializer(orders, many=True).data
            print(serialized_orders, 'this is the serialized order')
            return Response({'orders': serialized_orders}, status=200)
        else:
            return Response({'message': 'No orders found'}, status=404)
