import sys
import os

# Add /app to the Python path
sys.path.append('/app')

from confluent_kafka import Consumer
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

consumer = Consumer({
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'notification_group',
    'auto.offset.reset': 'earliest'
})

consumer.subscribe(['notifications'])

print("Kafka consumer started. Listening for notifications...")

while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue
    if msg.error():
        print(f"Consumer error: {msg.error()}")
        continue

    try:
        data = json.loads(msg.value().decode('utf-8'))
        user_id = data.get("user_id")
        group_name = f"user_{user_id}"
        print('Sending to group:', group_name, data)
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "data": data
            }
        )
    except Exception as e:
        print(f"Failed to process message: {e}")