# Generated by Django 5.1.5 on 2025-03-04 05:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trade', '0008_order_account'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='price',
            field=models.DecimalField(decimal_places=2, default=1.0, max_digits=10),
            preserve_default=False,
        ),
    ]
