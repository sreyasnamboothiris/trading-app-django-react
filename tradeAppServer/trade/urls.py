from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TradeTestApiView.as_view()),
    path('order/',views.OrderView.as_view())
    

]
