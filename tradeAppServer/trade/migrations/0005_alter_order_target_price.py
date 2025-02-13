# Generated by Django 5.1.5 on 2025-02-10 14:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trade', '0004_order_target_price_trigger'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='target_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
