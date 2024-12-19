from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from user.models import CustomUser
from user.serializers import UserSerializers



class UserListView(ListAPIView):
    
    permission_classes = [IsAdminUser]  # Only admin users can access this view
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializers

    def get(self, request, *args, **kwargs):
        # Get the paginated queryset using the ListAPIView mechanism
        users = self.get_queryset()
        
        total_users = CustomUser.objects.count()
        
        # Return the serialized data
        return Response({
        'users': UserSerializers(users, many=True).data,
        'totalUsers': total_users
    }, status=status.HTTP_200_OK)
    

class AdminUserDetailView(APIView):
    # Ensure only admins can access this view
    permission_classes = [IsAdminUser]

    def get(self, request, id):
        try:
            user = CustomUser.objects.get(pk=id)
            serializer = UserSerializers(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, id):
        try:
            user = CustomUser.objects.get(pk=id)
            
            # Admin can update any user's profile, so no user ownership check is needed here
            updated_data = request.data.copy()
            
            # Remove email/username if they are not updated (to prevent unnecessary changes)
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
                    (error[0] for error in serializer.errors.values() if isinstance(error, list) and error), 
                    "Invalid data submitted."
                )
                return Response({"error": first_error_message}, status=status.HTTP_400_BAD_REQUEST)

        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        

    def post(self, request):
        """Admin can create a new user"""
        # Create the user with the data provided in the request
        serializer = UserSerializers(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.save()  # This will handle password hashing and other validations
            return Response({
                "message": "User created successfully",
                "user": UserSerializers(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BlockUserView(APIView):

    permission_classes = [IsAdminUser]
    
    def post(self,reqeust):
        user_id = reqeust.data['user_id']
        try:
            user = CustomUser.objects.get(id=user_id)
            if user.status:
                user.status = False
            else:
                user.status = True
            user.save()
            print(user.status)
            return Response("Successfully completed",status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:

            return Response("failed",status=status.HTTP_404_NOT_FOUND)
