import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async


class AssetConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        from market.models import Asset
        await self.channel_layer.group_add("asset_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("asset_updates", self.channel_name)

    async def receive(self, text_data):
        # Handle any messages from client if needed
        pass

    async def asset_update(self, event):
        # Send asset data to WebSocket
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def get_assets(self):
        return list(Asset.objects.all().values())
