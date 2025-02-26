from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Follow, Post, Notification
from .serializers import PostSerializer, NotificationSerializer
from kafka import KafkaProducer
import json


class PostListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(user__in=request.user.following.values('following'))
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(user=request.user)
            producer = KafkaProducer(bootstrap_servers='kafka:9092')

            # Отправляем пост в топик new_posts
            producer.send('new_posts', json.dumps(serializer.data).encode('utf-8'))

            # Отправляем уведомления подписчикам
            followers = Follow.objects.filter(following=request.user).values_list('follower', flat=True)
            print('### KAFKA SHOULD SEND THE NOTIF', followers)
            for follower_id in followers:
                notification_data = {
                    'user_id': follower_id,
                    'message': f"{request.user.username} опубликовал новый пост!",
                    'post_id': post.id,
                }
                producer.send('notifications', json.dumps(notification_data).encode('utf-8'))

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class FollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get('user_id')
        following = User.objects.get(username=username)
        follow, created = Follow.objects.get_or_create(follower=request.user, following=following)
        if created:
            # Создаем уведомление
            print('### TEST CREATE FollowView post: ', follow, following)
            Notification.objects.create(
                user=following,
                message=f"{request.user.username} подписался на вас!"
            )
            # Отправляем в Kafka
            producer = KafkaProducer(bootstrap_servers='kafka:9092')
            producer.send('notifications', json.dumps({
                'user_id': following.id,
                'message': f"{request.user.username} подписался на вас!"
            }).encode('utf-8'))
        return Response({'status': 'followed'}, status=201)
