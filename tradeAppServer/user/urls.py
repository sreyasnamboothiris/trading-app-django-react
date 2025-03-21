from django.urls import path
from . import views

urlpatterns = [

    # for signup,login
    path('signup/', views.UserSignupView.as_view()),  # for signup
    path('otp/verification/', views.VerifyOtpView.as_view()),
    path('otp/resend/', views.ResendOtpView.as_view()),
    path('login/', views.UserLoginView.as_view()),
    path('token/refresh/', views.UserRefreshTokenView.as_view()),
    path('logout/', views.LogoutView.as_view()),

    # for profile management
    path('profile/<int:pk>/', views.UserDetailView.as_view()),
    path('profile/edit/<int:pk>/', views.UserDetailView.as_view()),
    path('password/reset/', views.PasswordResetView.as_view(), name='password_reset'),
    path('account/create/', views.AccountView.as_view(), name='create-account'),
    path('account/list/', views.AccountView.as_view(), name='account-list'),
    path('account/update/', views.AccountView.as_view(), name='switch-update'),
    path('account/delete/', views.AccountView.as_view(), name='delete-acount'),

    # Watchlist
    path('account/watchlists/', views.WatchlistView.as_view(), name='watchlist-view'),
    path('account/watchlists/list/',views.WatchlistItemView.as_view(),name='watchlist-update'),
    path('account/watchlists/list/<int:watchlistId>/',views.WatchlistItemView.as_view(),name='watchlist-update'),
    path('account/watchlists/list/<int:watchlistId>/<int:assetId>/', views.WatchlistItemView.as_view(), name='watchlist-item-delete'),

    # Portfolio
    path('account/portfolio/', views.PortfolioView.as_view(), name='portfolio-view'),

    # other details
    path('currency/list/', views.CurrencyListView.as_view(), name='currency-list'),
    path('api/test/', views.TestApi.as_view()),


]
