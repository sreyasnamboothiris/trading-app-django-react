from django.urls import path
from . import views

urlpatterns = [
    path('signup/',views.UserSignupView.as_view()), # for signup
    path('otp/verification/',views.VerifyOTPView.as_view()),
    path('otp/resend/',views.ResendOTPView.as_view()),
    path('login/',views.UserLoginView.as_view()),
    path('profile/<int:pk>/',views.UserDetailView.as_view()),
    path('token/refresh/',views.UserRefreshTokenView.as_view()),
    path('profile/edit/<int:pk>/',views.UserDetailView.as_view()),
    path('logout/',views.LogoutView.as_view()),
    path('password/reset/', views.PasswordResetView.as_view(), name='password_reset'),

    path('account/create/', views.CreateAccountView.as_view(), name='create-account'),
    path('currency/list/', views.CurrencyListView.as_view(), name='currency-list'),
    path('account/list/', views.AccountListView.as_view(), name='account-list'),
    
]
