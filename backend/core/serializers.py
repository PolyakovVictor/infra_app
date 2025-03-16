from rest_framework import serializers
from .models import Post, Notification, UserProfile, Like, Comment


class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    likes_count = serializers.ReadOnlyField()
    reposts_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "content",
            "created_at",
            "updated_at",
            "original_post",
            "is_repost",
            "likes_count",
            "reposts_count",
            "comments_count",
            "is_liked",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "post", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ["id", "user", "post", "content", "created_at"]


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
