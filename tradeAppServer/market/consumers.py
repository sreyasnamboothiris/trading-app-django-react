import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class AssetConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """Handle new WebSocket connections."""
        self.watchlist_id = None
        self.update_task = None  # Track periodic task

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if self.update_task:
            self.update_task.cancel()  # Cancel any existing update task
        await self.channel_layer.group_discard("asset_updates", self.channel_name)

    async def receive(self, text_data):
        """Receive messages from frontend and fetch assets for a given watchlist."""
        text_data_json = json.loads(text_data)
        watchlist_id = text_data_json.get("watchlist_id")

        if watchlist_id:
            self.watchlist_id = watchlist_id
            # Fetch the latest watchlist assets
            assets = await self.get_watchlist_assets(watchlist_id)

            # Send assets to the WebSocket
            await self.send(text_data=json.dumps({"assets": assets}))

            # Start sending periodic updates every second
            if self.update_task:
                self.update_task.cancel()  # Cancel previous task if any
            self.update_task = asyncio.create_task(self.send_periodic_updates())

    async def asset_update(self, event):
        """Receive and send asset update from group."""
        await self.send(text_data=json.dumps(event["data"]))

    @database_sync_to_async
    def get_watchlist_assets(self, watchlist_id):
        """Fetch assets for a given watchlist from the database."""
        from user.models import Watchlist, WatchlistItem  # Import here to avoid circular imports
        from market.models import Asset  # Import here to avoid circular imports
        from user.serializers import WatchlistItemSerializer
        try:
            # Fetch the watchlist and its items
            watchlist = Watchlist.objects.get(id=watchlist_id)
            watchlist_items = WatchlistItem.objects.filter(watchlist=watchlist)

            # Fetch asset details for each WatchlistItem
            assets = WatchlistItemSerializer(watchlist_items,many = True)
            print(assets.data)
            return assets.data
        except Watchlist.DoesNotExist:
            return []  # Return an empty list if watchlist is not found

    async def send_periodic_updates(self):
        """Fetch and send assets every second."""
        try:
            while True:
                if not self.watchlist_id:
                    break  # Stop if watchlist_id is not set

                # Fetch the latest assets for the given watchlist_id
                assets = await self.get_watchlist_assets(self.watchlist_id)
                
                # Send assets to the WebSocket
                await self.send(text_data=json.dumps({"assets": assets}))

                # Wait for 1 second before fetching and sending the next update
                await asyncio.sleep(1)

        except asyncio.CancelledError:
            pass  # Handle task cancellation gracefully

