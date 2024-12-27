# user/views.py
from rest_framework import status
from rest_framework import generics
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils.timezone import now
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate 
import random
from .models import CustomUser, Account
from mpadmin.models import Currency
from .serializers import PasswordResetSerializer, UserSerializers, AccountSerializer, CurrencySerializer
from rest_framework.generics import ListAPIView
import json
from rest_framework_simplejwt.authentication import JWTAuthentication



# Create your views here.
class UserSignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username')
        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(username=username).exists():
            return Response({"error":"Username already registered."})
       
        otp = random.randint(1000, 9999) # Generates a random number between 1000 and 9999
        otp_expiry = (now() + timedelta(seconds=45)).timestamp()
        userInfo = {
            "username":username,
            "email":email,
            "password":password,
            "otp":otp,
            "otp_expiry":otp_expiry

        }
        subject = "Your OTP for Signup"
        message = f"Your OTP for signup is {otp}. It is valid for 45 seconds"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email,'sreyasnamboothiri@gmail.com']
        
        try:
            send_mail(subject, message, from_email, recipient_list)
            return Response({"message": "OTP sent successfully. Please check your email.","userInfo":userInfo}, status=status.HTTP_200_OK)
 

        except Exception as e:
            return Response({"error": "Failed to send OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        print(request.body)
        user_otp = int(request.data.get('otp'))
        userInfo = request.data['userInfo']
        username = userInfo['username']
        email = userInfo['email']
        password = userInfo['password']
        otp = userInfo['otp']
        otp_expiry = userInfo['otp_expiry']
        if otp != user_otp:
            
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        
        if now().timestamp() > otp_expiry:
            return Response({"error": "OTP has expired. Please register again."}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data ={
            'username': username,
            'password': password,
            'email': email
        }
        serializer = UserSerializers(data=user_data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message":"OTP verified. User registered successfully."},status = status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print(request.body)
        userInfo = request.data['userInfo']
        username = userInfo['username']
        email = userInfo['email']
        password = userInfo['password']
        otp = random.randint(1000, 9999) # Generates a random number between 1000 and 9999
        otp_expiry = (now() + timedelta(seconds=45)).timestamp()
        userInfo = {
            "username":username,
            "email":email,
            "password":password,
            "otp":otp,
            "otp_expiry":otp_expiry

        }
        subject = "Your OTP for Signup"
        message = f"Your new OTP is {otp}. It is valid for 45 minute."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email,'sreyasnamboothiri@gmail.com']
        try:
            send_mail(subject, message, from_email, recipient_list)
            return Response({"message": "OTP sent successfully. Please check your email.","userInfo":userInfo}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Failed to resend OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        
        
        # Get the email and password from the request
        email = request.data.get('email')
        password = request.data.get('password')

        # Log function variables to the debug file
        
        try:
            user = CustomUser.objects.get(email=email)
            if user.is_active == False:
                return Response(
                {"error": "User has been blocked."}, status=400
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User with the provided email does not exist."}, status=status.HTTP_404_NOT_FOUND
            )
        
        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user is None:
            raise AuthenticationFailed("Invalid email or password")

        # Log successful authentication to the debug log
        
        # Generate JWT token for the authenticated user
        refresh = RefreshToken.for_user(authenticated_user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email,
            'user_id': user.pk,
            'is_staff':user.is_staff,
            'status':user.is_active
        }, status=status.HTTP_200_OK)


class UserRefreshTokenView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        
        refresh_token = request.data.get('refresh')
        user_id = request.data.get('user_id')
        print(user_id)
        user = CustomUser.objects.get(id=user_id)
        if not refresh_token:
            return Response({
                "error":"Refresh token is required"
            }, status = status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user_id': user_id,
                'is_staff':user.is_staff,
                'status':user.is_active
            },status = status.HTTP_200_OK)
        
        except TokenError:
            raise AuthenticationFailed('Invalid refresh token or expired.')

        
class UserDetailView(APIView):

    def get(self,request,pk):
         
        user = CustomUser.objects.get(pk=pk)
        serializer = UserSerializers(user)
        return Response(serializer.data,status=200)
    
    def patch(self,request,pk):

        try:
            user = CustomUser.objects.get(pk=pk)

            if user!= request.user:
                return Response({"error": "You are not authorized to update this profile."}, status=status.HTTP_403_FORBIDDEN)
            updated_data = request.data.copy()
            if 'email' in updated_data and updated_data['email'] == user.email:
                del updated_data['email']
            if 'username' in updated_data and updated_data['username'] == user.username:
                del updated_data['username']
            serializer = UserSerializers(user, data=updated_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                data = {
                    "message":"Successfully updated user",
                    'data':serializer.data
                }
                return Response(data, status=status.HTTP_200_OK)
            else:
                first_error_message = next(
                    (error[0] for error in serializer.errors.values() if isinstance(error, list) and error), 
                    "Invalid data submitted."
                )
                return Response({"error": first_error_message}, status=status.HTTP_400_BAD_REQUEST)
            
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)



    Response({},status=200)


class LogoutView(APIView):

    permission_classes = (IsAuthenticated,)
    def post(self,reqeust):
        
        try:
            refresh_token = reqeust.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        

class PasswordResetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class CreateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = AccountSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)  # Associate the account with the logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CurrencyListView(ListAPIView):
    permission_classes=[IsAuthenticated]
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer


class AccountListView(ListAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)