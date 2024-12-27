import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Currency, Account
from django.core.exceptions import ValidationError

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','first_name','last_name', 'username', 'email', 'is_active', 'profile_picture', 'password', 'is_superuser','date_joined','plan','is_staff')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True},
        }
    def get_profile_picture(self, obj):
        request = self.context.get('request')  # Get the request from the serializer's context
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            # Construct the full URL for the image
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def validate_email(self, value):
        
        value = value.strip()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Invalid email format.")

        # Check if email is unique
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already taken.")

        return value

    def validate_password(self, value):
        # Skip validation if password is hashed (e.g., during updates)
        if value.startswith('pbkdf2_sha256$'):
            return value

        # Password validation rules
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        
        return value

    def create(self, validated_data):
        # Handle password hashing during user creation
        password = validated_data.get('password', None)
        print(password)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    def to_representation(self, instance):
        # Call the parent method to get the original representation
        representation = super().to_representation(instance)
        
        # Format the date_joined field to only include the date part
        if 'date_joined' in representation:
            representation['date_joined'] = instance.date_joined.date().strftime('%Y-%m-%d')
        
        return representation

    def update(self, instance, validated_data):
        # Handle password hashing during updates
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class CurrencySerializer(serializers.ModelSerializer):

    class Meta:
        model = Currency
        fields = ['id', 'name', 'symbol','is_active']


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'currency', 'funds','is_active']

    def validate(self, data):
        user = self.context['request'].user

        # Check if the user already has 2 accounts
        if Account.objects.filter(user=user).count() >= 2:
            raise serializers.ValidationError("You can create a maximum of 2 accounts.")

        return data
    
class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'name', 'code']



class PasswordResetSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")

        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")

        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")

        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special symbol.")

        return value

    def validate(self, data):
        # Check if passwords match
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Perform additional Django password validation
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})

        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user