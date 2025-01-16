# user/views.py
from django.db import IntegrityError
from pydantic import ValidationError
from rest_framework import status
from rest_framework import generics
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils.timezone import now
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView  # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
import random
from market.serializers import AssetSerializer
from market.models import Asset
from .models import CustomUser, Account, TemporaryUser, Watchlist, WatchlistItem
from mpadmin.models import Currency
from .serializers import PasswordResetSerializer, UserSerializers, AccountSerializer, CurrencySerializer, WatchlistItemSerializer, WatchlistSerializer
from rest_framework.generics import ListAPIView
import json
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

load_dotenv()
##### User signup, login, logout, and token #####


class UserSignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(username=username).exists():
            return Response({"error": "Username already registered."})

        # Generates a random number between 1000 and 9999
        otp = random.randint(1000, 9999)
        otp_expiry = now() + timedelta(seconds=45)
        temp_user, created = TemporaryUser.objects.update_or_create(
            email=email,
            defaults={
                'username': username,
                'password': password,
                'otp': otp,
                'otp_expiry': otp_expiry
            }
        )
        message = Mail(
            from_email='sreyassweb@gmail.com',
            to_emails=[email, 'sreyasstrader@gmail.com'],
            subject='Your OTP',
            html_content=(
                f"<strong>Hi,</strong><br>"
                f"This mail is for the verification of MoneyMinder.<br>"
                f"Your OTP is: <strong>{otp}</strong>.<br>"
                f"Use it to complete your task."
            ))
        try:
            sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            response = sg.send(message)
            return Response({"email": email}, status=200)
        except Exception as e:
            print(str(e), 'printing')
            return Response({}, status=500)


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('enteredOtp')
        print(request.data)
        print(email, otp)
        # Check if the user exists in TemporaryUser
        try:
            temp_user = TemporaryUser.objects.get(email=email)
        except TemporaryUser.DoesNotExist:
            return Response({"error": "Temporary user not found."}, status=status.HTTP_404_NOT_FOUND)

        # Validate OTP
        if temp_user.otp != int(otp):
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        if now() > temp_user.otp_expiry:
            return Response({"error": "OTP expired."}, status=status.HTTP_400_BAD_REQUEST)
        print(temp_user)
        # Create the permanent user
        user = CustomUser.objects.create_user(
            username=temp_user.username,
            email=temp_user.email,
            password=temp_user.password
        )
        # Cleanup the TemporaryUser instance
        temp_user.delete()

        return Response({"message": "OTP verified and user created successfully."}, status=status.HTTP_201_CREATED)


class ResendOtpView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')

        # Check if the user exists in TemporaryUser
        try:
            temp_user = TemporaryUser.objects.get(email=email)
        except TemporaryUser.DoesNotExist:
            return Response({"error": "Temporary user not found."}, status=status.HTTP_404_NOT_FOUND)

        # Generate a new OTP and update the user
        otp = random.randint(1000, 9999)
        otp_expiry = now() + timedelta(seconds=45)
        temp_user.otp = otp
        temp_user.otp_expiry = otp_expiry
        temp_user.save()

        # Resend the OTP via email
        message = Mail(
            from_email='sreyassweb@gmail.com',
            to_emails=[email, 'sreyasstrader@gmail.com'],
            subject='Resend OTP',
            html_content=(
                f"<strong>Hi,</strong><br>"
                f"This mail is for the verification of MoneyMinder.<br>"
                f"Your OTP is: <strong>{otp}</strong>.<br>"
                f"Use it to complete your task."
            ))
        try:
            sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            sg.send(message)
            return Response({"message": "OTP resent successfully.", "email": email}, status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response({"error": "Failed to send OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

        authenticated_user = authenticate(
            username=user.username, password=password)
        if authenticated_user is None:
            raise AuthenticationFailed("Invalid email or password")

        # Log successful authentication to the debug log

        # Generate JWT token for the authenticated user
        refresh = RefreshToken.for_user(authenticated_user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.pk,
            'is_staff': user.is_staff,
            'status': user.is_active
        }, status=status.HTTP_200_OK)


class UserRefreshTokenView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):

        refresh_token = request.data.get('refresh')
        user_id = request.data.get('user_id')
        user = CustomUser.objects.get(id=user_id)
        if not refresh_token:
            return Response({
                "error": "Refresh token is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user_id': user_id,
                'is_staff': user.is_staff,
                'status': user.is_active
            }, status=status.HTTP_200_OK)

        except TokenError:
            raise AuthenticationFailed('Invalid refresh token or expired.')


class LogoutView(APIView):

    permission_classes = (IsAuthenticated,)

    def post(self, reqeust):

        try:
            refresh_token = reqeust.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

##### User details and accountmanagement ######


class UserDetailView(APIView):

    def get(self, request, pk):

        user = CustomUser.objects.get(pk=pk)
        try:

            account = Account.objects.get(user=user, is_active=True)
        except:
            pass

        serializer = UserSerializers(user)
        account_serializer = AccountSerializer(account)
        data = {
            "user": serializer.data,
            "account": account_serializer.data
        }
        return Response(data, status=200)

    def patch(self, request, pk):

        try:
            user = CustomUser.objects.get(pk=pk)

            if user != request.user:
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
                    "message": "Successfully updated user",
                    'data': serializer.data
                }
                return Response(data, status=status.HTTP_200_OK)
            else:
                first_error_message = next(
                    (error[0] for error in serializer.errors.values()
                     if isinstance(error, list) and error),
                    "Invalid data submitted."
                )
                return Response({"error": first_error_message}, status=status.HTTP_400_BAD_REQUEST)

        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    Response({}, status=200)


class PasswordResetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AccountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountSerializer
    queryset = Account.objects.all()

    def get(self, request, *args, **kwargs):
        # List accounts for the logged-in user
        accounts = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(accounts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # Create a new account
        serializer = self.get_serializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            # Associate the account with the logged-in user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        # Handle both "switch account" and "edit account" operations
        user = request.user
        account_id = request.data.get("account_id")
        if not account_id:

            return Response({"error": "Account ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = self.get_queryset().filter(id=account_id, user=user).first()
            if not account:
                return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)
            # Determine if it's a "switch account" or "edit account" operation
            if "is_active" in request.data and request.data.get("is_active") == True:
                # Switch account: Deactivate all other accounts and activate the selected account
                self.get_queryset().filter(user=user).update(is_active=False)
                account.is_active = True
                account.save()
                return Response({"message": "Account switched successfully."}, status=status.HTTP_200_OK)
            else:
                # Edit account: Update account details
                serializer = self.get_serializer(
                    account, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(
                        {"message": "Account updated successfully.",
                            "data": serializer.data},
                        status=status.HTTP_200_OK,
                    )
                else:
                    print(serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, *args, **kwargs):
        # Delete an account
        user = request.user
        account_id = request.data.get("account_id")

        if not account_id:
            return Response({"error": "Account ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the account to delete
            account = self.get_queryset().filter(id=account_id, user=user).first()

            if not account:
                return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if the account is active and if it's the only account
            if account.is_active:
                # Check if the user has only one account
                user_accounts = self.get_queryset().filter(user=user)
                if user_accounts.count() == 1:
                    return Response({"error": "You must have at least one account."}, status=status.HTTP_400_BAD_REQUEST)

                # If the account is active and not the only one, deactivate it and switch to another active account
                account.is_active = False
                account.save()

                # Activate another account
                next_account = user_accounts.exclude(id=account.id).first()
                if next_account:
                    next_account.is_active = True
                    next_account.save()

            # Delete the account
            account.delete()

            return Response({"message": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


##### User watchlist #####
class WatchlistView(APIView):
    def get(self, request):
        print('ivde vannu')
        try:
            # Fetch all watchlists for the authenticated user
            watchlists = Watchlist.objects.filter(
                user=request.user).order_by('name')  # Alphabetical order
            # Serialize the data
            print(watchlists)
            serializer = WatchlistSerializer(watchlists, many=True)
            print(serializer.data)
            for i in serializer.data:
                print(i)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        # Get the data from the request
        data = request.data
        user_id = data.get('user_id')
        name = data.get('name')

        try:
            # Fetch the Account object based on user_id
            account = Account.objects.get(user=user_id, is_active=True)
            user = CustomUser.objects.get(id=user_id)
            existing_watchlists = Watchlist.objects.filter(
                account=account).count()
            if existing_watchlists >= 2:
                # Return error response if more than 2 watchlists exist
                return Response({
                    "error": "Error: You can only have a maximum of 2 watchlists per account."
                }, status=status.HTTP_400_BAD_REQUEST)
            # Create a new Watchlist instance
            new_watchlist = Watchlist(
                name=name,
                account=account,
                user=user
            )

            # Perform validation on the Watchlist instance (to check if there are already 2 watchlists for the account)
            new_watchlist.clean()

            # Try saving the new watchlist
            new_watchlist.save()

            # Return success response with the watchlist data
            return Response({
                "message": "Watchlist created successfully!",
                "watchlist": {
                    "id": new_watchlist.id,
                    "name": new_watchlist.name,
                    "account_id": new_watchlist.account.id
                }
            }, status=status.HTTP_201_CREATED)

        except Account.DoesNotExist:
            # Return error if the account does not exist or is inactive
            return Response({
                "message": "Account not found or inactive."
            }, status=status.HTTP_400_BAD_REQUEST)

        except CustomUser.DoesNotExist:
            # Return error if the user is not found
            return Response({
                "message": "User not found."
            }, status=status.HTTP_400_BAD_REQUEST)

        except ValidationError as e:
            # Return validation errors if max 2 watchlists constraint is violated
            return Response({
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError:
            # Return error if there's an IntegrityError (e.g., duplicate watchlist name within an account)
            return Response({
                "message": "A watchlist with this name already exists for the account."
            }, status=status.HTTP_400_BAD_REQUEST)


class WatchlistItemView(APIView):

    def get(self, request, watchlistId):
        # Fetch the watchlist by its ID
        try:
            watchlist = Watchlist.objects.get(id=watchlistId)
        except Watchlist.DoesNotExist:
            return Response({"error": "Watchlist not found"}, status=404)

        watchlist_items = WatchlistItem.objects.filter(watchlist=watchlist)

        # Serialize the watchlist items
        serializer = WatchlistItemSerializer(watchlist_items, many=True)

        return Response(serializer.data, status=200)

    def post(self, request):
        print('ivde vannu sdfas')
        try:
            # Get the 'data' field from the request body
            # Safer way to access, avoiding key errors
            data = request.data.get('data')
            if not data:
                return Response({"message": "'data' field is missing in request body."}, status=status.HTTP_400_BAD_REQUEST)

            # Extract the watchlistId and assetId from the data
            watchlist_id = data['watchlistId']
            asset = data['asset']
            if watchlist_id is None or asset is None:
                print('enrter here00')
                return Response({"message": "'watchlistId' or 'assetId' is missing in 'data'."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the Watchlist and Asset objects
            try:
                watchlist = Watchlist.objects.get(id=watchlist_id)
            except Watchlist.DoesNotExist:
                return Response({"message": f"Watchlist with ID {watchlist_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

            try:
                asset = Asset.objects.get(id=asset['id'])
            except Asset.DoesNotExist:
                return Response({"message": "Asset not found."}, status=status.HTTP_404_NOT_FOUND)

            # Create the WatchlistItem
            watchlist_item = WatchlistItem.objects.create(
                watchlist=watchlist,
                asset=asset
            )

            # Return a success response
            return Response({"message": "Asset added to watchlist successfully!"}, status=status.HTTP_201_CREATED)

            # Return a success response
            return Response({"message": "Asset added to watchlist successfully!"}, status=status.HTTP_200_OK)

        except Exception as e:
            # Handle any other errors that may arise
            print(e)
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

##### Others #####


class CurrencyListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer


class TestApi(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Example logic for GET request
        data = {}
        return Response({"email": 'email@gmail.com'}, status=200)

    def post(self, request):
        print('ivde vannu sdfas')
        try:
            # Get the 'data' field from the request body
            # Safer way to access, avoiding key errors
            data = request.data.get('data')
            if not data:
                return Response({"message": "'data' field is missing in request body."}, status=status.HTTP_400_BAD_REQUEST)

            # Extract the watchlistId and assetId from the data
            watchlist_id = data['watchlistId']
            asset = data['asset']
            if watchlist_id is None or asset is None:
                print('enrter here00')
                return Response({"message": "'watchlistId' or 'assetId' is missing in 'data'."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the Watchlist and Asset objects
            try:
                watchlist = Watchlist.objects.get(id=watchlist_id)
            except Watchlist.DoesNotExist:
                return Response({"message": f"Watchlist with ID {watchlist_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

            try:
                asset = Asset.objects.get(id=asset['id'])
            except Asset.DoesNotExist:
                return Response({"message": "Asset not found."}, status=status.HTTP_404_NOT_FOUND)

            # Create the WatchlistItem
            watchlist_item = WatchlistItem.objects.create(
                watchlist=watchlist,
                asset=asset
            )

            # Return a success response
            return Response({"message": "Asset added to watchlist successfully!"}, status=status.HTTP_201_CREATED)

            # Return a success response
            return Response({"message": "Asset added to watchlist successfully!"}, status=status.HTTP_200_OK)

        except Exception as e:
            # Handle any other errors that may arise
            print(e)
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        # Example logic for PUT request (typically used to update resources)
        data = request.data
        # Update resource with the provided data
        data['message'] = 'Data has been updated!'
        return Response(data, status=status.HTTP_200_OK)

    def delete(self, reqeust):
        print('hellwo vannu')
        return Response(status=status.HTTP_200_OK)

    def patch(self, request):
        # Example logic for PATCH request (typically used for partial updates)
        data = request.data
        # Perform partial update to resource
        data['message'] = 'Data has been partially updated!'
        return Response(data, status=status.HTTP_200_OK)
