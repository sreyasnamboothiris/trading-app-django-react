import datetime
from decimal import Decimal
import re
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator,RegexValidator,EmailValidator,FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from mpadmin.models import Currency
from django.utils.timezone import now
from market.models import Asset


def validate_non_space_string(value):
    # Check if the string contains only spaces
    if not value or value.strip() == "":
        raise ValidationError(_("This field cannot contain only spaces. Please enter a valid value."))

def validate_password(value):
    """
    Custom validator for password strength.
    """
    if len(value) < 6:
        raise ValidationError(_("Password must be at least 6 characters long."))
    if not re.search(r'[A-Z]', value):
        raise ValidationError(_("Password must contain at least one uppercase letter."))
    if not re.search(r'[a-z]', value):
        raise ValidationError(_("Password must contain at least one lowercase letter."))
    if not re.search(r'\d', value):
        raise ValidationError(_("Password must contain at least one number."))
    if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', value):
        raise ValidationError(_("Password must contain at least one special symbol."))

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
        default='default_pics/default_profile_pic.png',
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
    def get_active_account(self):
        return self.accounts.filter(is_active=True).first()

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


class TemporaryUser(models.Model):
    email = models.EmailField(
        unique=True,
        validators=[
            EmailValidator(message=_("Please enter a valid email address."))
        ],
        error_messages={"unique": _("This email address is already registered.")}
    )
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

    password = models.CharField(
        max_length=128,
        validators=[validate_password]  # Add custom password validator
    )
    otp = models.IntegerField()
    otp_expiry = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def is_otp_expired(self):
        return now() > self.otp_expiry


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
    default_asset = models.ForeignKey(Asset, on_delete=models.SET_NULL, related_name="default_asset", default=Asset.objects.filter(name="Nifty 50",).first().id,null=True, 
    blank=True)
    is_active = models.BooleanField(default=False)
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


class Watchlist(models.Model):
    
    name = models.CharField(max_length=100, validators=[validate_non_space_string])
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="watchlists")
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="watchlists")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('account', 'name')  # Prevent duplicate watchlist names within an account.

    def clean(self):
        # Ensure max 2 watchlists per account
        print(self.account)
        if Watchlist.objects.filter(account=self.account).count() >= 2:
            raise ValidationError(_("An account can have a maximum of 2 watchlists."))
        super().clean()

    def __str__(self):
        return f"Watchlist: {self.name} (Account: {self.account.name})"


class WatchlistItem(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name="items")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="watchlist_items")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('watchlist', 'asset')  # Prevent duplicate assets within the same watchlist.

    def __str__(self):
        return f"Asset: {self.asset.name} in {self.watchlist.name}"



    