from rest_framework import serializers
from .models import CustomUser

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'status', 'profile_picture', 'password', 'is_superuser')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    
