from django.core.management.base import BaseCommand
import asyncio
import json
import websockets
import redis

# Initialize Redis client
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

def store_price(symbol, price, source):
    """Stores price in Redis and publishes an update event."""
    key = f"{source}:{symbol}"
    redis_client.set(key, price)
    
    # Publish update event to Redis Pub/Sub
    update_data = {"symbol": symbol, "price": price, "source": source}
    redis_client.publish("market_prices", json.dumps(update_data))

def on_binance_price_update(symbol, price):
    store_price(symbol, price, "binance")

class Command(BaseCommand):
    help = 'Runs the Binance WebSocket for market data'

    def handle(self, *args, **kwargs):
        """
        This method runs the Binance WebSocket connection.
        """
        # Fetch assets from Django model
        from market.models import Asset
        assets = Asset.objects.filter(is_crypto=True, symbol__isnull=False)
        binance_symbols = [asset.symbol for asset in assets]

        # Prepare Binance URL
        symbols = [symbol.lower() for symbol in binance_symbols]
        url = f"wss://stream.binance.com:9443/stream?streams=" + \
            "/".join([f"{symbol}@trade" for symbol in symbols])

        async def start_binance_websocket():
            """Connect to Binance WebSocket and handle the real-time price updates."""
            async with websockets.connect(url) as ws:
                while True:
                    response = await ws.recv()
                    data = json.loads(response)
                    if "data" in data:
                        symbol = data["data"]["s"]  # Symbol from the stream
                        price = float(data["data"]["p"])  # Latest trade price
                        print(f"Updated {symbol} Price: {price}")

                        # Store the updated price in Redis
                        redis_client.setex(f"binance:{symbol}", 10, price)
                        on_binance_price_update(symbol, price)
                        print(f"Updated {symbol} Price stored in Redis.")

        asyncio.run(start_binance_websocket())