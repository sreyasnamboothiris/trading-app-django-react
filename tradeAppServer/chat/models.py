from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    """Chat room between a user and the admin"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_chat_rooms")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_chat_rooms")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=False)

    def __str__(self):
        return f"Chat between {self.user.username} and Admin ({self.admin.username})"


class ChatMessage(models.Model):
    """Stores chat messages"""
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.text[:20]}"
