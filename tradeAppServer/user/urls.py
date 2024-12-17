from django.urls import path
from . import views

urlpatterns = [
    path('signup/',views.UserSignupView.as_view()), # for signup
    path('otp/verification/',views.VerifyOTPView.as_view()),
    path('otp/resend/',views.ResendOTPView.as_view()),
    path('login/',views.UserLoginView.as_view()),
    path('profile/<int:pk>/',views.UserDetailView.as_view()),
    path('token/refresh/',views.UserRefreshTokenView.as_view()),
    path('profile/edit/<int:pk>/',views.UserDetailView.as_view())
    
]
