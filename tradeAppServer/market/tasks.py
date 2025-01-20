from celery import shared_task
from .models import Asset
import yfinance as yf
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from datetime import timedelta


@shared_task
def update_asset_prices():
    """
    Periodic task to update asset prices from Yahoo Finance at 1-minute intervals.
    """
    assets = Asset.objects.all()

    print(assets)


# Create interval schedule for every 1 minute
schedule, created = IntervalSchedule.objects.get_or_create(
    every=1,
    period=IntervalSchedule.MINUTES,  # Set to minutes for the periodic task
)

# Create periodic task if it doesn't exist
PeriodicTask.objects.get_or_create(
    interval=schedule,
    name='Update Asset Prices Every Minute',
    task='market.tasks.update_asset_prices',
    expires=None
)
