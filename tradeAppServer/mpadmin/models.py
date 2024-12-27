from django.db import models

# Create your models here.

from django.db import models

class Currency(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10, unique=True)  # E.g., USD, USDT
    symbol = models.CharField(max_length=10, null=True, blank=True)  # Symbol like $, ฿
    is_crypto = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
