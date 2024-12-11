# user/views.py
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserSerializers



# Create your views here.
class UserSignupView(generics.CreateAPIView):
    
    serializer_class = UserSerializers
    permission_classes = [AllowAny]


class UserLoginView(APIView):
   

    def post(self, request):
        
        email = request.data.get('email')
        password = request.data.get('password')

        
        if not email or not password:
            raise AuthenticationFailed("Email and password are required.")

        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed("User with this email does not exist.")

        
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect password.")

        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response({
            'access': access_token,
            'refresh': refresh_token
        }, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    permission_classes = [IsAuthenticated] 
    
    def post(self, request):
        
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)

            
            access_token = refresh.access_token

            return Response({
                "access": str(access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            
            return Response({"detail": f"Token error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
