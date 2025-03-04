import json
import os
import time
from dotenv import load_dotenv
import redis
import pyotp
from django.core.management.base import BaseCommand
from SmartApi.smartWebSocketV2 import SmartWebSocketV2
from SmartApi import SmartConnect
import environ

load_dotenv()

# Initialize Redis client
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

def store_price(symbol, price, source):
    """Stores price in Redis and publishes an update event."""
    key = f"{source}:{symbol}"
    try:
        redis_client.set(key, price, ex=60)  # Expire data in 60 seconds
        update_data = {"symbol": symbol, "price": price, "source": source}
        redis_client.publish("market_prices", json.dumps(update_data))
        print('✅ Price stored in Redis:', key, price)
    except redis.RedisError as e:
        print(f"❌ Redis Error: {e}")

class Command(BaseCommand):
    help = 'Runs the SmartAPI WebSocket for market data'

    def handle(self, *args, **kwargs):
        """
        Runs the SmartAPI WebSocket connection.
        """
        API_KEY = os.getenv("API_KEY")
        CLIENT_CODE = os.getenv("CLIENT_CODE")
        PASSWORD = os.getenv("PASSWORD")
        MPIN = os.getenv("MPIN")
        TOTP_SECRET_KEY = os.getenv("TOTP_SECRET_KEY")
        print(API_KEY, CLIENT_CODE, PASSWORD, MPIN, TOTP_SECRET_KEY)
        totp = pyotp.TOTP(TOTP_SECRET_KEY)
        TOTP_CODE = totp.now()

        smart_api = SmartConnect(api_key=API_KEY)
        
        data = smart_api.generateSession(CLIENT_CODE, MPIN, TOTP_CODE)

        if "data" not in data or "feedToken" not in data["data"]:
            print("❌ Failed to generate feed token! Check API response:", data)
            return  # Exit safely

        FEED_TOKEN = data["data"]["feedToken"]
        jwt_token = data["data"]["jwtToken"]
        JWT_TOKEN = jwt_token.split(" ")[1]
        print("SmartAPI Feed Token:", FEED_TOKEN)

        # WebSocket Configuration
        correlation_id = "nishant_123_qwerty"
        mode = 3  # Full Market Data Mode

        global sws
        sws = SmartWebSocketV2(auth_token=JWT_TOKEN, api_key=API_KEY,
                               client_code=CLIENT_CODE, feed_token=FEED_TOKEN)

        def on_data(wsapp, message):
            """Handle incoming market data."""
            print(f"📊 Ticks at {time.strftime('%H:%M:%S')}: {message}")
            if 'token' in message and 'last_traded_price' in message:
                symbol = message['token']
                price = message['last_traded_price']
                store_price(symbol, price, "smartapi")

        def on_open(wsapp):
            """Subscribe to required tokens after WebSocket opens."""
            from market.models import Asset
            assets = Asset.objects.filter(smart_api_token__isnull=False)
            smartapi_tokens = [{"exchangeType": 1, "tokens": [asset.smart_api_token]} for asset in assets]

            print("✅ WebSocket Connection Opened! Subscribing to SmartAPI tokens...")
            sws.subscribe(correlation_id, mode, smartapi_tokens)

        def on_error(wsapp, error):
            """Handle WebSocket errors."""
            print(f"❌ WebSocket Error: {error}")

        def on_close(wsapp):
            """Reconnect WebSocket if closed."""
            print("⚠️ WebSocket Closed! Cleaning up and Reconnecting in 5 seconds...")
            global sws
            time.sleep(5)
            if sws:
                try:
                    sws.close()
                except Exception as e:
                    print(f"⚠️ Error closing WebSocket: {e}")
            start_smartapi_websocket()

        def start_smartapi_websocket():
            """Start the SmartAPI WebSocket connection."""
            sws.connect()

        # Assign Callbacks
        sws.on_open = on_open
        sws.on_data = on_data
        sws.on_error = on_error
        sws.on_close = on_close

        # Start WebSocket
        start_smartapi_websocket()
