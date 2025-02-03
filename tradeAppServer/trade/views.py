from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny

# Test View with JWT Authentication
class TradeTestApiView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        
        return Response({"message": "Trade API is working!"})


