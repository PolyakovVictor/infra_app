from kafka import KafkaConsumer
import json
import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # Убедитесь, что backend.settings — правильный путь
django.setup()

# Абсолютный импорт моделей
from core.models import Notification  # Импорт вашей модели Notification
from django.contrib.auth.models import User   # User из Django


def consume_notifications():
    consumer = KafkaConsumer(
        'notifications',
        bootstrap_servers='kafka:9092',
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='notification_group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    print("Starting notification consumer...")
    for message in consumer:
        data = message.value
        user = User.objects.get(id=data['user_id'])
        Notification.objects.create(
            user=user,
            message=data['message']
        )
        print(f"Created notification for {user.username}: {data['message']}")


if __name__ == "__main__":
    consume_notifications()