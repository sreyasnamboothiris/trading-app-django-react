
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/',admin.site.urls),
    path('user/',include('user.urls')),
    path('mp-admin/',include('mpadmin.urls')),
    path('accounts/', include('allauth.urls')),
    path('market/',include('market.urls')),
    path('trade/',include('trade.urls')),
    path('chat/',include('chat.urls')),
    
]



urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)