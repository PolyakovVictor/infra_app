from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Follow, Post, Notification
from .serializers import PostSerializer, NotificationSerializer
from kafka import KafkaProducer
import json


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid credentials'}, status=400)


class PostListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(user__in=request.user.following.values('following'))
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            # Отправка в Kafka
            producer = KafkaProducer(bootstrap_servers='kafka:9092')
            producer.send('new_posts', json.dumps(serializer.data).encode('utf-8'))
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
        following_id = request.data.get('user_id')
        following = User.objects.get(id=following_id)
        Follow.objects.get_or_create(follower=request.user, following=following)
        return Response({'status': 'followed'}, status=201)
