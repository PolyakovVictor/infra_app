from django.urls import path
from .views import PostListView, NotificationListView, FollowView, UserProfileView, UserPostsView

urlpatterns = [
    path('posts/', PostListView.as_view(), name='posts'),
    path('user_posts/', UserPostsView.as_view(), name='UserPosts'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('follow/', FollowView.as_view(), name='follow'),
    path('profile/', UserProfileView.as_view(), name='UserProfile'),
]
