from django.contrib import admin
from .models import Post, Follow, Notification, UserProfile


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    pass


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    pass


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    pass


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    pass
