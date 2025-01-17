from celery import shared_task
from .models import Asset
import yfinance as yf
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from datetime import timedelta


@shared_task
def update_asset_prices():
    """
    Periodic task to update asset prices from Yahoo Finance in bulk
    """
    assets = Asset.objects.all()
    print(f"Updating asset {assets}")

    symbols = [asset.yfinance_symbol for asset in assets]

    if not symbols:
        return

    try:
        # Fetch data in bulk
        tickers = yf.Tickers(' '.join(symbols))

        # Prepare bulk update
        updates = []
        for asset in assets:
            try:
                current_price = tickers.tickers[asset.yfinance_symbol].info.get(
                    'regularMarketPrice')
                if current_price:
                    print(
                        f"Updating asset {asset.yfinance_symbol} with price {current_price}")
                    asset.last_traded_price = current_price
                    updates.append(asset)
            except Exception as e:
                print(f"Error getting price for {asset.yfinance_symbol}: {str(e)}")
                continue

        # Bulk update the database
        if updates:
            Asset.objects.bulk_update(updates, ['current_price'])

    except Exception as e:
        print(f"Error in bulk price update: {str(e)}")


# Create interval schedule for every 1 minute
schedule, created = IntervalSchedule.objects.get_or_create(
    every=1,
    period=IntervalSchedule.SECONDS,
)

# Create periodic task if it doesn't exist
PeriodicTask.objects.get_or_create(
    interval=schedule,
    name='Update Asset Prices',
    task='market.tasks.update_asset_prices',
    expires=None
)
