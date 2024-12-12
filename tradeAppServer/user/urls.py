from django.urls import path
from . import views 

urlpatterns = [
    path('signup/',views.UserSignupView.as_view()), # for signup
    path('login/',views.UserLoginView.as_view())
]
