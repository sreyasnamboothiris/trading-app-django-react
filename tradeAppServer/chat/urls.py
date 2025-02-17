
from django.urls import path, include
from .views import Test

urlpatterns = [
    path('message/',Test.as_view(), name='asset-search'),
]

