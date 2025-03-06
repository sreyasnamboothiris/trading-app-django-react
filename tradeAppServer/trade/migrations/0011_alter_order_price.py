# Generated by Django 5.1.5 on 2025-03-04 08:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trade', '0010_alter_order_trade_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
