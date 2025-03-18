from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import Follow, Post, Notification, UserProfile, Like, Comment
from .serializers import (
    PostSerializer,
    NotificationSerializer,
    UserProfileSerializer,
    LikeSerializer,
    CommentSerializer,
)
from .utils.kafka_producer import producer
import logging
from django.http import Http404


logger = logging.getLogger("core.views")


def send_kafka_event(topic, data):
    try:
        producer.send(topic, data)
        logger.debug(f"Event sent to Kafka topic '{topic}': {data}")
    except Exception as e:
        logger.error(
            f"Failed to send event to Kafka topic '{topic}': {str(e)}", exc_info=True
        )


class PostListView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        logger.info(f"Retrieving posts for user {self.request.user.username}")
        following_ids = self.request.user.following.values_list("following", flat=True)
        return Post.objects.filter(user__in=following_ids).order_by("-created_at")

    def perform_create(self, serializer):
        logger.info(f"Creating a new post by user {self.request.user.username}")
        try:
            post = serializer.save(user=self.request.user)
            logger.debug(f"Post saved: ID={post.id}")

            send_kafka_event("new_posts", serializer.data)

            followers = Follow.objects.filter(following=self.request.user).values_list(
                "follower", flat=True
            )
            for follower_id in followers:
                notification_data = {
                    "user_id": follower_id,
                    "message": f"{self.request.user.username} published a new post!",
                    "post_id": post.id,
                }
                send_kafka_event("notifications", notification_data)
        except Exception as e:
            logger.error(f"Error creating post: {str(e)}", exc_info=True)
            raise


class NotificationListView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        logger.info(f"Retrieving notifications for user {self.request.user.username}")
        return Notification.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )


class FollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info(f"User {request.user.username} attempting to follow another user")
        user = request.data.get("user")

        try:
            following = User.objects.get(username=user)
        except User.DoesNotExist:
            logger.warning(f"User with username {user} not found")
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            follow, created = Follow.objects.get_or_create(
                follower=request.user, following=following
            )
            if created:
                logger.info(
                    f"New follow: {request.user.username} -> {following.username}"
                )
                notification_data = {
                    "user_id": following.id,
                    "message": f"{request.user.username} has followed you!",
                }
                send_kafka_event("notifications", notification_data)
                Notification.objects.create(
                    user=following, message=notification_data["message"]
                )
            else:
                logger.debug(
                    f"Already following: {request.user.username} -> {following.username}"
                )
            return Response({"status": "followed"}, status=status.HTTP_201_CREATED)
        except IntegrityError:
            logger.warning(
                f"Duplicate follow attempt: {request.user.username} -> {following.username}"
            )
            return Response(
                {"error": "Already following"}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error during follow: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to follow user"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserProfileView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        user = self.request.query_params.get("user")
        logger.info(f"Retrieving profile for {user}")
        try:
            return UserProfile.objects.get(user__username=user)
        except UserProfile.DoesNotExist:
            logger.warning(f"Profile for {user} not found")
            raise Http404("Profile not found")


class UserPostsView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        user = self.request.query_params.get("user")
        logger.info(f"Retrieving posts for user {user}")
        return Post.objects.filter(user__username=user).order_by("-created_at")


class GetCurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info(f"Retrieving current user: {request.user.username}")
        return Response({"username": request.user.username})


class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        logger.info(f"User {request.user.username} attempting to like post {post_id}")
        try:
            post = Post.objects.get(id=post_id)
            like, created = Like.objects.get_or_create(user=request.user, post=post)
            if created:
                logger.info(f"Post {post_id} liked by {request.user.username}")
                notification_data = {
                    "user_id": post.user.id,
                    "message": f"{request.user.username} liked your post!",
                    "post_id": post.id,
                }
                send_kafka_event("notifications", notification_data)
                Notification.objects.create(
                    user=post.user,
                    message=notification_data["message"],
                    related_post=post,
                )
                send_kafka_event(
                    "user_interactions",
                    {
                        "event_type": "like",
                        "user_id": request.user.id,
                        "post_id": post.id,
                    },
                )
                return Response({"status": "liked"}, status=status.HTTP_201_CREATED)
            else:
                like.delete()
                logger.info(f"Post {post_id} unliked by {request.user.username}")
                return Response({"status": "unliked"}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            logger.warning(f"Post {post_id} not found")
            return Response(
                {"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error liking post {post_id}: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to like post"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RepostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        logger.info(f"User {request.user.username} attempting to repost post {post_id}")
        try:
            original_post = Post.objects.get(id=post_id)
            repost = Post.objects.create(
                user=request.user,
                content=original_post.content,
                original_post=original_post,
                is_repost=True,
            )
            logger.info(
                f"Post {post_id} reposted by {request.user.username} as {repost.id}"
            )
            notification_data = {
                "user_id": original_post.user.id,
                "message": f"{request.user.username} reposted your post!",
                "post_id": original_post.id,
            }
            send_kafka_event("notifications", notification_data)
            Notification.objects.create(
                user=original_post.user,
                message=notification_data["message"],
                related_post=original_post,
            )
            send_kafka_event(
                "user_interactions",
                {
                    "event_type": "repost",
                    "user_id": request.user.id,
                    "post_id": repost.id,
                },
            )
            return Response(PostSerializer(repost).data, status=status.HTTP_201_CREATED)
        except Post.DoesNotExist:
            logger.warning(f"Post {post_id} not found")
            return Response(
                {"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error reposting post {post_id}: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to repost"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CommentView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs["post_id"]
        return Comment.objects.filter(post_id=post_id).order_by("-created_at")

    def perform_create(self, serializer):
        post_id = self.kwargs["post_id"]
        logger.info(f"User {self.request.user.username} commenting on post {post_id}")
        try:
            post = Post.objects.get(id=post_id)
            comment = serializer.save(user=self.request.user, post=post)
            notification_data = {
                "user_id": post.user.id,
                "message": f"{self.request.user.username} commented on your post!",
                "post_id": post.id,
            }
            send_kafka_event("notifications", notification_data)
            Notification.objects.create(
                user=post.user, message=notification_data["message"], related_post=post
            )
            send_kafka_event(
                "user_interactions",
                {
                    "event_type": "comment",
                    "user_id": self.request.user.id,
                    "post_id": post.id,
                },
            )
        except Post.DoesNotExist:
            logger.warning(f"Post {post_id} not found")
            raise
