from django.urls import path
from . import views

urlpatterns = [
    path('users/',views.UserListView.as_view(),name='user-list'),
    path('user/edit/<int:id>/',views.AdminUserDetailView.as_view()),
    path('user/create/',views.AdminUserDetailView.as_view()),
    path('user/block/',views.BlockUserView.as_view()),

    path('currencies/',views.CurrencyListView.as_view())

]
