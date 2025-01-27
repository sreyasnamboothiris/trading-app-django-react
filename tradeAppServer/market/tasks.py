from celery import shared_task
from .models import Asset
import yfinance as yf
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from datetime import timedelta
import http.client
import json
import http.client
import mimetypes
import pyotp
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

@shared_task
def update_asset_prices():
    """
    Periodic task to update asset prices from Yahoo Finance at 1-minute intervals.
    """
    local_ip = "172.29.208.1"
    mac = '00-15-5D-98-2D-E5'
    public_ip = '2406:8800:81:dae1:a8fb:5430:4823:f1a8'
    client_id = "S671931"
    password = "Sre@8281"
    mpin = "8129"

    seceret_key = 'P3AYFAQUPSVDCYJ6KSE4ILROQQ'
    totp = pyotp.TOTP(seceret_key)
    current_otp = totp.now()
    conn = http.client.HTTPSConnection(
        "apiconnect.angelone.in"
    )
    payload = (
        f"{{\n"
        f"\"clientcode\":\"{client_id}\"\n"
        f",\n\"password\":\"{mpin}\"\n"
        f",\n\"totp\":\"{current_otp}\"\n"
        f",\n\"state\":\"STATE_VARIBALE\"\n"
        f"}}"
    )

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': local_ip,
        'X-ClientPublicIP': public_ip,
        'X-MACAddress': mac,
        'X-PrivateKey': 'QTg9v9zT'
    }
    conn.request(
        "POST",
        "/rest/auth/angelbroking/user/v1/loginByPassword",
        payload,
        headers)

    token_list = list(Asset.objects.all().values_list(
        'smart_api_token', flat=True))
    res = conn.getresponse()
    if res.status != 200:
        return
    response_data = res.read().decode("utf-8")
    response_json = json.loads(response_data)
    jwt_token = response_json['data']['jwtToken']
    payload = {
        "mode": "FULL",
        "exchangeTokens": {
            "NSE": token_list
        }
    }
    payload_json = json.dumps(payload)
    headers = {
        'Authorization': f"Bearer {jwt_token}",
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': local_ip,
        'X-ClientPublicIP': public_ip,
        'X-MACAddress': mac,
        'X-PrivateKey': 'QTg9v9zT'
    }
    conn.request("POST",
                 "/rest/secure/angelbroking/market/v1/quote/",
                 body=payload_json,
                 headers=headers)

    res = conn.getresponse()
    data = res.read().decode("utf-8")
    data = json.loads(data)
    assets_to_update = []
    
    for asset_data in data.get('data', {}).get('fetched', []):
        token = asset_data.get("symbolToken")
        ltp = asset_data.get("ltp")
        if token and ltp:
            try:
                asset = Asset.objects.get(smart_api_token=token)
                asset.last_traded_price = ltp  # Update relevant fields
                asset.percent_change = asset_data.get("percentChange")
                asset.net_change = asset_data.get("netChange")
                assets_to_update.append(asset)
            except Asset.DoesNotExist:
                continue
    Asset.objects.bulk_update(
        assets_to_update, ['last_traded_price', 'percent_change', 'net_change'], batch_size=100)
    print(data)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)("asset_updates", {"type": "asset_update", "data": data})

# Create interval schedule for every 1 minute
schedule, created = IntervalSchedule.objects.get_or_create(
    every=1,
    period=IntervalSchedule.SECONDS,  # Set to minutes for the periodic task
)

# Create periodic task if it doesn't exist
PeriodicTask.objects.get_or_create(
    interval=schedule,
    name='Update Asset Prices Every second',
    task='market.tasks.update_asset_prices',
    expires=None
)
