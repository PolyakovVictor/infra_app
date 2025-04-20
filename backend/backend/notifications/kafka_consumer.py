import json
from confluent_kafka import Consumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import django
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()


channel_layer = get_channel_layer()

consumer_conf = {
    'bootstrap.servers': os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
    'group.id': 'notification_group',
    'auto.offset.reset': 'earliest'
}

consumer = Consumer(consumer_conf)
consumer.subscribe(['new_posts'])

print("Kafka consumer for notifications started.")

try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue

        notification = json.loads(msg.value().decode('utf-8'))
        user_id = notification.get("user_id")

        if user_id:
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                {
                    "type": "send_notification",
                    "data": notification,
                }
            )

except KeyboardInterrupt:
    pass
finally:
    consumer.close()
