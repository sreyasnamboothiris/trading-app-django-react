# Generated by Django 5.1.3 on 2024-12-27 04:45

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_alter_account_currency_account_is_active_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='profile_picture',
            field=models.ImageField(blank=True, default='default_pics/default_profile_pic.png', null=True, upload_to='profile_pics/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'], message='Only JPG, JPEG, and PNG files are allowed for profile pictures.')]),
        ),
    ]