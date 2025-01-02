# Generated by Django 5.1.3 on 2024-12-25 18:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mpadmin', '0002_currency_is_active'),
        ('user', '0004_remove_customuser_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='currency',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mpadmin.currency'),
        ),
        migrations.AddField(
            model_name='account',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.DeleteModel(
            name='Currency',
        ),
    ]