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
from .models import User
from .serializers import UserSerializers



# Create your views here.
class UserSignupView(generics.CreateAPIView):
    
    serializer_class = UserSerializers
    permission_classes = [AllowAny]


class UserLoginView(APIView):
    """
    View to handle user login with email and password authentication and JWT token generation.
    """

    def post(self, request):
        
        email = request.data.get('email')
        password = request.data.get('password')

        # Check if email and password are provided
        if not email or not password:
            raise AuthenticationFailed("Email and password are required.")

        # Authenticate user using email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("User with this email does not exist.")

        # Check if the password is correct
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect password.")

        # Create JWT tokens (access and refresh)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response({
            'access': access_token,
            'refresh': refresh_token
        }, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    
    def post(self, request):
        # Get the refresh token from the request
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validate the refresh token
            refresh = RefreshToken(refresh_token)

            # Generate a new access token
            access_token = refresh.access_token

            return Response({
                "access": str(access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            # Handle invalid or expired refresh tokens
            return Response({"detail": f"Token error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
