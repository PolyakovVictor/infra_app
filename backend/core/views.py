from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Follow, Post, Notification
from .serializers import PostSerializer, NotificationSerializer
from kafka import KafkaProducer
import json
import logging


logger = logging.getLogger('core.views')


class PostListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info(f"Retrieving list of posts for user {request.user.username}")
        try:
            posts = Post.objects.filter(user__in=request.user.following.values('following'))
            serializer = PostSerializer(posts, many=True)
            logger.debug(f"Found {len(posts)} posts for serialization")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving posts: {str(e)}", exc_info=True)
            return Response({"error": "Failed to retrieve posts"}, status=500)

    def post(self, request):
        logger.info(f"Creating a new post by user {request.user.username}")
        serializer = PostSerializer(data=request.data)

        if serializer.is_valid():
            try:
                post = serializer.save(user=request.user)
                logger.debug(f"Post successfully saved: ID={post.id}")

                # Initialize Kafka Producer
                producer = KafkaProducer(bootstrap_servers='kafka:9092')
                logger.debug("Kafka Producer initialized")

                # Send post to new_posts topic
                producer.send('new_posts', json.dumps(serializer.data).encode('utf-8'))
                logger.info(f"Post sent to 'new_posts' topic: ID={post.id}")

                # Send notifications to followers
                followers = Follow.objects.filter(following=request.user).values_list('follower', flat=True)
                logger.debug(f"Found {len(followers)} followers for notifications: {list(followers)}")

                for follower_id in followers:
                    notification_data = {
                        'user_id': follower_id,
                        'message': f"{request.user.username} published a new post!",
                        'post_id': post.id,
                    }
                    producer.send('notifications', json.dumps(notification_data).encode('utf-8'))
                    logger.debug(f"Notification sent to user ID={follower_id}")

                return Response(serializer.data, status=201)
            except Exception as e:
                logger.error(f"Error creating post or sending to Kafka: {str(e)}", exc_info=True)
                return Response({"error": "Failed to create post"}, status=500)
        else:
            logger.warning(f"Invalid data for post: {serializer.errors}")
            return Response(serializer.errors, status=400)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info(f"Retrieving notifications for user {request.user.username}")
        try:
            notifications = Notification.objects.filter(user=request.user)
            logger.debug(f"Found {notifications.count()} notifications for user {request.user.username}")
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving notifications: {str(e)}", exc_info=True)
            return Response({"error": "Failed to retrieve notifications"}, status=500)


class FollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info(f"User {request.user.username} attempting to follow another user")
        username = request.data.get('user_id')

        try:
            following = User.objects.get(username=username)
            logger.debug(f"Found user to follow: {following.username}")
        except User.DoesNotExist:
            logger.warning(f"User with username {username} not found")
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            logger.error(f"Error fetching user {username}: {str(e)}", exc_info=True)
            return Response({"error": "Internal server error"}, status=500)

        try:
            follow, created = Follow.objects.get_or_create(follower=request.user, following=following)
            if created:
                logger.info(f"New follow relationship created: {request.user.username} -> {following.username}")

                # Create notification
                Notification.objects.create(
                    user=following,
                    message=f"{request.user.username} has followed you!"
                )
                logger.debug(f"Notification created for user {following.username}")

                # Send to Kafka
                producer = KafkaProducer(bootstrap_servers='kafka:9092')
                logger.debug("Kafka Producer initialized")
                notification_data = {
                    'user_id': following.id,
                    'message': f"{request.user.username} has followed you!"
                }
                producer.send('notifications', json.dumps(notification_data).encode('utf-8'))
                logger.info(f"Notification sent to Kafka for user ID={following.id}")
            else:
                logger.debug(f"Follow relationship already exists: {request.user.username} -> {following.username}")

            return Response({'status': 'followed'}, status=201)

        except Exception as e:
            logger.error(f"Error during follow operation or Kafka send: {str(e)}", exc_info=True)
            return Response({"error": "Failed to follow user"}, status=500)
