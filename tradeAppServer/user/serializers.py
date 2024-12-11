from rest_framework import serializers
from .models import CustomUser

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'status', 'profile_picture', 'password', 'is_superuser')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        # Automatically generate username from email if not provided
        if 'username' not in validated_data:
            email = validated_data.get('email')
            username = email.split('@')[0]  # Generate username from email

            # Check if the username is already taken
            if CustomUser.objects.filter(username=username).exists():
                username = f"{username}{CustomUser.objects.filter(username__startswith=username).count() + 1}"

            validated_data['username'] = username

        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])  # Hash the password before saving
        user.save()  # Save the user
        return user
