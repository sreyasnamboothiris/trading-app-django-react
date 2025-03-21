# Generated by Django 5.1.5 on 2025-03-11 04:05

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('market', '0008_remove_asset_yfinance_symbol'),
        ('user', '0012_alter_account_default_asset'),
    ]

    operations = [
        migrations.CreateModel(
            name='Portfolio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=4, help_text='Number of asset units owned.', max_digits=15, validators=[django.core.validators.MinValueValidator(Decimal('0.0001'))])),
                ('average_price', models.DecimalField(decimal_places=2, help_text='Average purchase price per unit.', max_digits=15, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))])),
                ('total_value', models.DecimalField(decimal_places=2, default=0.0, help_text='Current total value of the holding.', max_digits=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='portfolios', to='market.asset')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='portfolios', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'asset')},
            },
        ),
    ]
