# user/views.py
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate 
from .models import CustomUser
from .serializers import UserSerializers



# Create your views here.
class UserSignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = UserSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message":"user created successfully"},
                status = status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self,request):

        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"error":"User with the provided email does not exist."},status = status.HTTP_404_NOT_FOUND
            )
        
        authenticated_user = authenticate(username=user.username,password=password)
        if authenticated_user is None:
            raise AuthenticationFailed("Invalid email or passowrd")

        refresh = RefreshToken.for_user(authenticated_user)

        return Response({
            'access':str(refresh.access_token),
            'refresh':str(refresh),
            'username':user.username,
            'email':user.email
        }, status = status.HTTP_200_OK)
        
        
        
class UserDetailView(APIView):

    def get(self,requsest):
        print('get wokring anu')
        return Response({},status=200)
    print('ethi')
    pass
Response({},status=200)


