from celery import shared_task
from django.db import transaction
from trade.models import Order

@shared_task
def execute_pending_orders_task(order_ids, price):
    """Process pending orders in bulk"""
    print(f"🚀 Processing {len(order_ids)} orders in background...")

    # Fetch pending orders in bulk
    orders = list(Order.objects.filter(id__in=order_ids, status='pending'))
    
    if not orders:
        print("⚠️ No matching pending orders found")
        return "No orders found"

    # Update order fields
    for order in orders:
        order.status = 'executed'
        order.price = price

    # Bulk update (efficient database operation)
    with transaction.atomic():
        Order.objects.bulk_update(orders, ['status', 'price'])

    print(f"✅ Successfully executed {len(orders)} orders")
    return f"{len(orders)} orders executed"
