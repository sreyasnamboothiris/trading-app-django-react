from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TradeTestApiView.as_view()),

]
