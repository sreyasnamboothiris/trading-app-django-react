# from django.http import JsonResponse
# from django.utils.deprecation import MiddlewareMixin
# from user.models import CustomUser  # Replace with the actual path to your CustomUser model

# class UserStatusMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         # Get the user ID from the request (Assuming user_id is passed as part of the URL or headers)
#         user_id = request.user.id
#         if user_id:
#             try:
#                 # Fetch the user object
#                 user = CustomUser.objects.get(id=user_id)

#                 # If the user's status is False, return a BadRequest response
#                 if not user.status:
#                     return JsonResponse({"error": "User is blocked. Bad request."}, status=400)
                
#             except CustomUser.DoesNotExist:
#                 return JsonResponse({"error": "User not found."}, status=404)

#         # If no issues, proceed with the request
#         return None
