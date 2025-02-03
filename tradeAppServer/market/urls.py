
from django.urls import path, include
from .views import AssetSearchView

urlpatterns = [
    path('assets/search/',AssetSearchView.as_view(), name='asset-search'),
]

