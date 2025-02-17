"""
    Created on Monday Feb 2, 2022

    @author: Nishant Jain

    :copyright: (c) 2022 by Angel One Limited
"""
import asyncio
import json
import pyotp
import time
from SmartApi.smartWebSocketV2 import SmartWebSocketV2
from SmartApi import SmartConnect
import websockets
from tradeAppServer.market.models import Asset

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", 'tradeAppServer.settings')
django.setup()
assets = Asset.objects.all()
binance_symbols = []
smartapi_tokens = []

for asset in assets:
    print(asset.name, asset.smart_api_token, asset.symbol)

    # Add symbol for Binance WebSocket
    if asset.is_crypto:
        binance_symbols.append(asset.symbol)

    # Add smart_api_token for SmartAPI WebSocket if available
    if asset.smart_api_token:
        smartapi_tokens.append({
            "exchangeType": 1,  # Example for NIFTY, adjust based on your API setup
            "tokens": [asset.smart_api_token]
        })


symbols = [symbol.lower() for symbol in binance_symbols]
url = f"wss://stream.binance.com:9443/stream?streams=" + \
    "/".join([f"{symbol}@trade" for symbol in symbols])


async def binance_websocket():
    async with websockets.connect(url) as ws:
        while True:
            response = await ws.recv()
            data = json.loads(response)
            if "data" in data:
                symbol = data["data"]["s"]  # Symbol from the stream
                price = float(data["data"]["p"])  # Latest trade price
                print(f"Updated {symbol} Price: {price}")

            # Store in Redis
            print(f"Updated BTC Price: {price}")

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


# ✅ Generate TOTP (One-Time Password)
totp = pyotp.TOTP(TOTP_SECRET_KEY)
current_otp = totp.now()

if "data" in data and "feedToken" in data["data"]:
    FEED_TOKEN = data["data"]["feedToken"]
    jwt_token = data["data"]["jwtToken"]
    JWT_TOKEN = jwt_token.split(" ")[1]
    print("SmartAPI Feed Token:", FEED_TOKEN)
else:
    raise Exception("Failed to generate feed token!")

# ✅ WebSocket Configuration
correlation_id = "nishant_123_qwerty"
mode = 3  # Full Market Data Mode

# ✅ Initialize WebSocket with extracted tokens
sws = SmartWebSocketV2(auth_token=JWT_TOKEN, api_key=API_KEY,
                       client_code=CLIENT_CODE, feed_token=FEED_TOKEN)


def on_data(wsapp, message):
    """Handle incoming market data."""
    print(f"Ticks at {time.strftime('%H:%M:%S')}: {message}")


def on_open(wsapp):
    """Subscribe to NIFTY 50 on WebSocket open."""
    print("WebSocket Connection Opened! Subscribing to NIFTY 50...")
    sws.subscribe(correlation_id, mode, smartapi_tokens)


def on_error(wsapp, error):
    """Handle WebSocket errors."""
    print(f"WebSocket Error: {error}")


def on_close(wsapp):
    """Reconnect WebSocket if closed."""
    print("WebSocket Closed! Reconnecting in 5 seconds...")
    time.sleep(5)
    start_websocket()


# ✅ Assign Callbacks
sws.on_open = on_open
sws.on_data = on_data
sws.on_error = on_error
sws.on_close = on_close


def start_websocket():

    sws.connect()

# ✅ Start WebSocket Connection

# ---------------- Run Both WebSockets ---------------- #


async def main():
    task1 = asyncio.create_task(binance_websocket())
    # Run SmartAPI in separate thread
    task2 = asyncio.to_thread(start_websocket)

    await asyncio.gather(task1, task2)

# Start WebSockets
asyncio.run(main())
