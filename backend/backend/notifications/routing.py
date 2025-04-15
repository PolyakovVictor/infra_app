from django.urls import re_path
from backend.notifications import consumers

websocket_urlpatterns = [
    re_path(r"ws/notifications/(?P<user_id>\w+)/$", consumers.NotificationConsumer.as_asgi()),
]
