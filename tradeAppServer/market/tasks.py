from celery import shared_task
from .models import Asset
import yfinance as yf
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from datetime import timedelta

# Task to update asset prices
@shared_task
def update_asset_prices():
    assets = Asset.objects.all()
    print('assets ivide unde', assets)
    for asset in assets:
        try:
            # Fetch live price using yfinance
            ticker = yf.Ticker(asset.yfinance_symbol)
            live_price = ticker.history(period="1d")['Close'].iloc[-1]
            
            # Update asset price in the database
            asset.last_traded_price = live_price
            asset.save()
            print(f"Updated {asset.asset_name} to {live_price}")
        except Exception as e:
            print(f"Failed to update {asset.asset_name}: {e}")

# Setup periodic task
def create_periodic_task():
    # Create an interval schedule that runs every 1 second
    schedule, created = IntervalSchedule.objects.get_or_create(every=1, period=IntervalSchedule.SECONDS)
    
    # Create or update the periodic task
    task, created = PeriodicTask.objects.get_or_create(
        interval=schedule,  # the schedule defined above
        name='Update Asset Prices Every Second',  # a unique name for the task
        task='market.tasks.update_asset_prices',  # task path
    )
    return task
