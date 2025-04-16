from django.urls import path
from .views import (
    LikePostView,
    PostListView,
    NotificationListView,
    FollowView,
    UserProfileView,
    UserPostsView,
    GetCurrentUserView,
    RepostView,
    CommentView,
)

urlpatterns = [
    path("posts/", PostListView.as_view(), name="posts"),
    path("user-posts/", UserPostsView.as_view(), name="UserPosts"),
    # path("notifications/", NotificationListView.as_view(), name="notifications"),
    path("follow/", FollowView.as_view(), name="follow"),
    path("profile/", UserProfileView.as_view(), name="UserProfile"),
    path("current-user/", GetCurrentUserView.as_view(), name="Get Current User"),
    path("posts/<int:post_id>/like/", LikePostView.as_view(), name="like-post"),
    path("posts/<int:post_id>/repost/", RepostView.as_view(), name="repost"),
    path("posts/<int:post_id>/comments/", CommentView.as_view(), name="comments"),
]
