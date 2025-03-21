from celery import shared_task
from django.db import transaction
from trade.models import Order
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
@shared_task
def execute_pending_orders_task(order_ids, price, redis_key):
    """Process pending orders in bulk"""

    # Fetch pending orders in bulk
    orders = list(Order.objects.filter(id__in=order_ids, status='pending'))
    
    if orders:
        print(f"🔹 Found {len(orders)} pending orders")

    # Update order fields
    for order in orders:
        order.status = 'executed'
        order.price = price
        redis_entry = json.dumps({
                    "id": order.id,
                    "price": float(order.limit_price), 
                    "order_type": "buy" if redis_key.endswith(":buy") else "sell"
                })
        print(f"Attempting to remove: {redis_entry}")
        order.save()
        # Remove the order from Redis
        removed_count = redis_client.zrem(redis_key, redis_entry)

        if removed_count > 0:
            print(f"Successfully removed {redis_entry}, {removed_count} from Redis!")
            
            

    
    return f"{len(orders)} orders executed"



