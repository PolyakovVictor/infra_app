import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
import logging
import json

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info(f"Connecting: {self.scope['path']}, query: {self.scope['query_string']}")
        token = self.scope['query_string'].decode().split('token=')[1] if 'token=' in self.scope['query_string'].decode() else None

        if not token:
            logger.warning("No token provided, closing connection")
            await self.close(code=403)
            return

        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token['user_id']
            self.group_name = f'user_{user_id}'
            logger.info(f"Adding to group: {self.group_name}")
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}, closing connection")
            await self.close(code=403)
            return

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))