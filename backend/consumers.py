from kafka import KafkaConsumer
import json
import os
import django
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Notification
from django.contrib.auth.models import User


def consume_notifications():
    consumer = KafkaConsumer(
        'notifications',
        bootstrap_servers='kafka:9092',
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='notification_group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    channel_layer = get_channel_layer()

    print("Starting notification consumer...")
    for message in consumer:
        try:
            data = message.value
            user_id = data['user_id']
            message_text = data['message']

            user = User.objects.get(id=user_id)
            notification = Notification.objects.create(user=user, message=message_text)
            print(f"Created notification for {user.username}: {message_text}")

            group_name = f'user_{user_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification',
                    'message': message_text
                }
            )
            print(f"Sent WebSocket notification to group {group_name}")

        except User.DoesNotExist:
            print(f"User with id {user_id} not found")
        except Exception as e:
            print(f"Error processing message: {e}")


if __name__ == "__main__":
    consume_notifications()
