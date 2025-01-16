from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tradeAppServer.settings')

app = Celery('tradeAppServer')
django.setup()
# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
