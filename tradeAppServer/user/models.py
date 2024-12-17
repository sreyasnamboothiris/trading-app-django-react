import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    status = models.BooleanField(blank=True, null=True, default=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/', blank=True, null=True, default='default.user.jpg'
    )
    dark_mode = models.BooleanField(default=True)
    plan = models.CharField(max_length=255, default='free')

    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',  # Adjusted related_name to avoid conflict
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',  # Adjusted related_name to avoid conflict
        blank=True
    )

    def __str__(self):
        return self.username
    

class OTP(models.Model):

    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField()

    def is_expired(self):
        return datetime.now() > self.expires_at