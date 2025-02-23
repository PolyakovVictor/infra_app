from django.urls import path
from .views import PostListView, NotificationListView, FollowView

urlpatterns = [
    path('posts/', PostListView.as_view(), name='posts'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('follow/', FollowView.as_view(), name='follow'),
]
