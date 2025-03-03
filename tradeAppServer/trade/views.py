from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import OrderSerializer
from .models import BaseOrder

# Test View with JWT Authentication


class TradeTestApiView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Return orders for the current authenticated user.
        print('helle')

    def post(self, request, *args, **kwargs):  # Add request parameter
        print('hello')
        print(request.data)
        
        return Response({"message": "Trade request received"}, status=200)


class OrderView(APIView):
    permission_classes = [AllowAny]



