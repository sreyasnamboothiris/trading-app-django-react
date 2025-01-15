# In your app's apps.py
from django.apps import AppConfig


class MarketConfig(AppConfig):
    name = 'market'

    def ready(self):
        from .tasks import create_periodic_task
        # Create periodic task when the app is ready
        create_periodic_task()
