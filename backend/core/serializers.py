from rest_framework import serializers
from .models import Post, Notification, UserProfile


class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Post
        fields = ["id", "user", "content", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    avatar = serializers.ImageField(use_url=True)

    class Meta:
        model = UserProfile
        fields = "__all__"
