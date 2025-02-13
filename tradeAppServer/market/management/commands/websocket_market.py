from django.core.management.base import BaseCommand
import asyncio
import json
import pyotp
import time
import redis
from SmartApi.smartWebSocketV2 import SmartWebSocketV2
from SmartApi import SmartConnect
import websockets
from market.models import Asset
import os
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tradeAppServer.settings")
django.setup()

# Initialize Redis client
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

class Command(BaseCommand):
    help = 'Runs the WebSocket for market data'

    def handle(self, *args, **kwargs):
        """
        This method runs both Binance and SmartAPI WebSocket connections.
        """
        # Fetch assets from Django model
        assets = Asset.objects.all()
        binance_symbols = []
        smartapi_tokens = []

        for asset in assets:
            print(asset.name, asset.smart_api_token, asset.symbol)

            # Add symbol for Binance WebSocket
            if asset.is_crypto:
                if asset.symbol:
                    binance_symbols.append(asset.symbol)

            # Add smart_api_token for SmartAPI WebSocket if available
            if asset.smart_api_token:
                smartapi_tokens.append({
                    "exchangeType": 1,  # Example for NIFTY, adjust based on your API setup
                    "tokens": [asset.smart_api_token]
                })

        # Prepare Binance URL
        symbols = [symbol.lower() for symbol in binance_symbols]
        url = f"wss://stream.binance.com:9443/stream?streams=" + \
            "/".join([f"{symbol}@trade" for symbol in symbols])

        # ---------------- Binance WebSocket ---------------- #
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
                        redis_client.set(f"binance:{symbol}", price)

                        # Optionally, you can store the price with an expiration time (e.g., 60 seconds)
                        # redis_client.setex(f"binance:{symbol}", 60, price)

                        print(f"Updated {symbol} Price stored in Redis.")

        # ---------------- SmartAPI WebSocket ---------------- #
        API_KEY = "QTg9v9zT"
        CLIENT_CODE = "S671931"
        PASSWORD = "Sre@8281"
        MPIN = "8129"
        TOTP_SECRET_KEY = "P3AYFAQUPSVDCYJ6KSE4ILROQQ"
        totp = pyotp.TOTP(TOTP_SECRET_KEY)
        TOTP_CODE = totp.now()
        smart_api = SmartConnect(api_key=API_KEY)
        data = smart_api.generateSession(CLIENT_CODE, MPIN, TOTP_CODE)
        print(data)

        # Local and public details for SmartAPI WebSocket
        MPIN = "8129"
        SECRET_KEY = 'P3AYFAQUPSVDCYJ6KSE4ILROQQ'
        PRIVATE_KEY = 'QTg9v9zT'  # API Key

        # Generate TOTP (One-Time Password)
        totp = pyotp.TOTP(SECRET_KEY)
        current_otp = totp.now()

        # Fetch Feed Token from SmartAPI
        if "data" in data and "feedToken" in data["data"]:
            FEED_TOKEN = data["data"]["feedToken"]
            jwt_token = data["data"]["jwtToken"]
            JWT_TOKEN = jwt_token.split(" ")[1]
            print("SmartAPI Feed Token:", FEED_TOKEN)
        else:
            raise Exception("Failed to generate feed token!")

        # WebSocket Configuration for SmartAPI
        correlation_id = "nishant_123_qwerty"
        mode = 3  # Full Market Data Mode
        token_list = [{"exchangeType": 1, "tokens": ["26009"]}]  # Example NIFTY 50 Token

        # Initialize SmartAPI WebSocket
        sws = SmartWebSocketV2(auth_token=JWT_TOKEN, api_key=API_KEY,
                               client_code=CLIENT_CODE, feed_token=FEED_TOKEN)

        def on_data(wsapp, message):
            """Handle incoming market data."""
            print(f"📊 Ticks at {time.strftime('%H:%M:%S')}: {message}")

            # Example of storing data in Redis for SmartAPI WebSocket
            if 'symbol' in message and 'price' in message:
                symbol = message['symbol']
                price = message['price']
                redis_client.set(f"smartapi:{symbol}", price)
                print(f"Updated {symbol} Price stored in Redis.")

        def on_open(wsapp):
            """Subscribe to NIFTY 50 on WebSocket open."""
            print("✅ WebSocket Connection Opened! Subscribing to NIFTY 50...")
            sws.subscribe(correlation_id, mode, smartapi_tokens)

        def on_error(wsapp, error):
            """Handle WebSocket errors."""
            print(f"❌ WebSocket Error: {error}")

        def on_close(wsapp):
            """Reconnect WebSocket if closed."""
            print("⚠️ WebSocket Closed! Reconnecting in 5 seconds...")
            time.sleep(5)
            start_smartapi_websocket()

        def start_smartapi_websocket():
            """Start the SmartAPI WebSocket connection."""
            sws.connect()

        # Assign Callbacks for SmartAPI WebSocket
        sws.on_open = on_open
        sws.on_data = on_data
        sws.on_error = on_error
        sws.on_close = on_close

        # ---------------- Run Both WebSockets ---------------- #
        async def main():
            # Run Binance WebSocket in one task
            task1 = asyncio.create_task(start_binance_websocket())
            # Run SmartAPI WebSocket in a separate thread
            task2 = asyncio.to_thread(start_smartapi_websocket)

            # Run both WebSocket connections concurrently
            await asyncio.gather(task1, task2)

        # Start both WebSocket connections
        asyncio.run(main())
