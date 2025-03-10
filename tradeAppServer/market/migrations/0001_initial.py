# Generated by Django 5.1.3 on 2025-01-15 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Asset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('asset_name', models.CharField(max_length=255)),
                ('asset_type', models.CharField(choices=[('index', 'Index'), ('stock', 'Stock'), ('crypto', 'Crypto')], max_length=20)),
                ('is_crypto', models.BooleanField(default=False)),
                ('tradingview_symbol', models.CharField(max_length=50)),
                ('last_traded_price', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True)),
            ],
        ),
    ]
