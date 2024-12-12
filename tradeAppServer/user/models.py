from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
import re

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
        related_name='customuser_set',  
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',  
        blank=True
    )

    def __str__(self):
        return self.username

    def clean(self):
        # Validate email
        self.email = self.email.strip()
        if not self.email:
            raise ValidationError("Email cannot be empty or just spaces.")

        # Check if email is already taken
        if CustomUser.objects.filter(email=self.email).exclude(id=self.id).exists():
            raise ValidationError("Email is already taken.")

        if not re.match(r"[^@]+@[^@]+\.[^@]+", self.email):
            raise ValidationError("Invalid email format.")

        # Validate password
        if len(self.password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not any(char.isdigit() for char in self.password):
            raise ValidationError("Password must contain at least one number.")
        if not any(char.isalpha() for char in self.password):
            raise ValidationError("Password must contain at least one letter.")
        

    def save(self, *args, **kwargs):
        
        # Automatically generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]  # Generate username from email

            # Check if the username is already taken
            if CustomUser.objects.filter(username=self.username).exists():
                self.username = f"{self.username}{CustomUser.objects.filter(username__startswith=self.username).count() + 1}"

        if self.password:  # Hash the password before saving
            self.set_password(self.password)

        super().save(*args, **kwargs)  # Save the instance


