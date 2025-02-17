import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer



class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from .models import ChatRoom, ChatMessage
        User = get_user_model()
        """Handles WebSocket connection"""
        print(self.scope)
        self.username = self.scope["url_route"]["kwargs"]["username"]
        self.user = self.scope["user"]

        try:
            self.chat_user = await User.objects.get(username=self.username)
        except User.DoesNotExist:
            await self.close()
            return

        if self.user.is_staff or self.user == self.chat_user:
            # Admin can chat with any user, User can only chat with admin
            self.room_group_name = f"chat_{self.username}"

            # Get or create chat room
            self.room, created = await ChatRoom.objects.get_or_create(user=self.chat_user, admin=self.user if self.user.is_staff else self.chat_user)

            # Add to room group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        """Handles WebSocket disconnection"""
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Handles receiving a message"""
        data = json.loads(text_data)
        message = data["message"]

        chat_message = await ChatMessage.objects.create(sender=self.user, room=self.room, text=message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": self.user.username,
            },
        )

    async def chat_message(self, event):
        """Sends message to WebSocket"""
        await self.send(text_data=json.dumps({"message": event["message"], "sender": event["sender"]}))
