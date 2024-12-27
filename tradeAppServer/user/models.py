import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator,RegexValidator,EmailValidator,FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from mpadmin.models import Currency


def validate_non_space_string(value):
    # Check if the string contains only spaces
    if not value or value.strip() == "":
        raise ValidationError(_("This field cannot contain only spaces. Please enter a valid value."))


class CustomUser(AbstractUser):
    # Custom username validation: Alphanumeric and underscores only
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\w+$',
                message=_("Username can only contain letters, numbers, and underscores.")
            ),
            validate_non_space_string
        ],
        error_messages={"unique": _("This username is already taken.")}
    )

    # Email validation (built-in EmailField validator ensures valid format)
    email = models.EmailField(
        unique=True,
        validators=[
            EmailValidator(message=_("Please enter a valid email address."))
        ],
        error_messages={"unique": _("This email address is already registered.")}
    )

    # First and last name validation: minimum 2 characters, no numbers
    first_name = models.CharField(
        blank=True,
        null=True,
        max_length=30,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z]{2,}$',
                message=_("First name must contain only letters and be at least 2 characters long.")
            ),
            validate_non_space_string
        ]
    )
    last_name = models.CharField(
        blank=True,
        null=True,
        max_length=30,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z]{2,}$',
                message=_("Last name must contain only letters and be at least 2 characters long.")
            )
        ]
    )

    # Profile picture validation: file type and size
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        blank=True,
        null=True,
        default='default.user.jpg',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png'],
                message=_("Only JPG, JPEG, and PNG files are allowed for profile pictures.")
            ),
            
        ]
    )

    
    dark_mode = models.BooleanField(default=True)
    plan = models.CharField(max_length=255, default='free')
    
    # Override the default related names to avoid conflicts with AbstractUser
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

    def clean(self):
        # Ensure username does not contain leading or trailing spaces
        if self.username != self.username.strip():
            raise ValidationError({"username": _("Username cannot contain leading or trailing spaces.")})
        

    def save(self, *args, **kwargs):
        # Enforce validation before saving
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
    

class OTP(models.Model):

    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField()

    def is_expired(self):
        return datetime.now() > self.expires_at
    

    

class Account(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="accounts")
    name = models.CharField(max_length=100)  # Account Name
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    funds = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0, message=("Funds must be a positive amount."))]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Validation for account name: minimum 4 characters, no extra spaces
        stripped_name = self.name.strip()
        if len(stripped_name) < 4:
            raise ValidationError(
                {"name": _("Account name must be at least 4 characters long after removing spaces.")}
            )
        self.name = stripped_name  # Save the cleaned name back to the model instance

        # Validation for funds: must be greater than or equal to 0
        if self.funds < 0:
            raise ValidationError(
                {"funds": _("Funds must be a positive amount.")}
            )

    def save(self, *args, **kwargs):
        # Call the full clean method to enforce validation before saving
        self.full_clean()
        super(Account, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.user.username}"