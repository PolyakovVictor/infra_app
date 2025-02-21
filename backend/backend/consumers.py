from kafka import KafkaConsumer
from django.contrib.auth.models import User
from core.models import Notification, Post
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

consumer = KafkaConsumer('new_posts', bootstrap_servers='kafka:9092', group_id='notifications')
channel_layer = get_channel_layer()

for message in consumer:
    post_data = json.loads(message.value.decode('utf-8'))
    post = Post.objects.get(id=post_data['id'])
    followers = User.objects.filter(following__following=post.user)
    for follower in followers:
        notification = Notification.objects.create(
            user=follower,
            message=f"{post.user.username} posted: {post.content[:50]}",
        )
        async_to_sync(channel_layer.group_send)(
            f'notifications_{follower.id}',
            {
                'type': 'notify',
                'id': notification.id,
                'message': notification.message,
                'created_at': notification.created_at.isoformat(),
            }
        )