import json
import asyncio
import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer

class AssetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle new WebSocket connections."""
        self.redis = None
        self.pubsub_task = None
        self.watchlist_symbols = set()
        print('connected')
        await self.accept()

        # Async Redis client connection
        self.redis = redis.Redis.from_url("redis://localhost", decode_responses=True)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if self.pubsub_task:
            self.pubsub_task.cancel()
        if self.redis:
            await self.redis.close()
        
    async def receive(self, text_data):
        """Handle frontend request to watch specific assets."""
        text_data_json = json.loads(text_data)
        watchlist_symbols = set(text_data_json.get("watchlist_symbols", []))
        # Only update if the watchlist has changed
        if watchlist_symbols != self.watchlist_symbols:
            self.watchlist_symbols = watchlist_symbols

            # Restart subscription to reflect the updated watchlist
            if self.pubsub_task:
                self.pubsub_task.cancel()

            self.pubsub_task = asyncio.create_task(self.listen_to_price_updates())

    async def listen_to_price_updates(self):
        """Subscribe to Redis and filter updates before sending to frontend."""
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("market_prices")

        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    symbol = data.get("symbol")

                    # Only send updates for symbols in the watchlist
                    if symbol in self.watchlist_symbols:
                        await self.send(text_data=json.dumps(data))

        except asyncio.CancelledError:
            print("Pub/Sub task canceled or disconnected.")
            pass  # Handle task cancellation gracefully
        except Exception as e:
            print(f"Error in listening to price updates: {str(e)}")
