from celery import shared_task
from .models import Asset
import yfinance as yf
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from datetime import timedelta

# Task to update asset prices
@shared_task
def update_asset_prices():
    assets = Asset.objects.all()
    print('Assets retrieved:', assets)
    # for asset in assets:
    #     try:
    #         # Fetch live price using yfinance
    #         ticker = yf.Ticker(asset.yfinance_symbol)
    #         history = ticker.history(period="1d")
            
    #         if history.empty:
    #             print(f"No data for {asset.asset_name}")
    #             continue
            
    #         live_price = history['Close'].iloc[-1]
            
    #         # Update asset price in the database
    #         asset.last_traded_price = live_price
    #         asset.save()
    #         print(f"Updated {asset.asset_name} to {live_price}")
    #     except Exception as e:
    #         print(f"Failed to update {asset.asset_name}: {e}")


# Setup periodic task

