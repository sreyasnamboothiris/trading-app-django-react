# Generated by Django 5.1.5 on 2025-03-03 04:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trade', '0007_remove_regularorder_asset_remove_regularorder_user_and_more'),
        ('user', '0012_alter_account_default_asset'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='account',
            field=models.ForeignKey(default=12, on_delete=django.db.models.deletion.CASCADE, to='user.account'),
            preserve_default=False,
        ),
    ]
