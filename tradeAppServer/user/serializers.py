from rest_framework import serializers
from .models import User
import re

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'status', 'profile_picture', 'password', 'is_superuser')
        extra_kwargs = {'password': {'write_only': True,'required':False}}

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username cannot be empty or just spaces.")
        if len(value) < 5:
            raise serializers.ValidationError("Username must be at least 5 characters long.")
        if not value.isalnum():
            raise serializers.ValidationError("Username should only contain alphanumeric characters.")
        return value

    def validate_email(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Email cannot be empty or just spaces.")
        
        
        if self.instance.email != value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already taken.")

        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Invalid email format.")
        return value

    def validate_password(self, value):
        
        return value

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)


        instance.save()
        return instance