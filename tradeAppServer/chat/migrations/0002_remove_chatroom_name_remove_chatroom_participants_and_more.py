# Generated by Django 5.1.5 on 2025-02-14 05:04

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chatroom',
            name='name',
        ),
        migrations.RemoveField(
            model_name='chatroom',
            name='participants',
        ),
        migrations.AddField(
            model_name='chatroom',
            name='admin',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='admin_chat_rooms', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='chatroom',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='chatroom',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='user_chat_rooms', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
