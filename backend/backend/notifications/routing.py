# routing.py
from django.urls import re_path
from backend.notifications import consumers

websocket_urlpatterns = [
    re_path(r"^notifications/$", consumers.NotificationConsumer.as_asgi()),
]