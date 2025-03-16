from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=280)
    original_post = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="reposts"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_repost = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def reposts_count(self):
        return self.reposts.count()

    @property
    def comments_count(self):
        return self.comments.count()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.CharField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"


class Follow(models.Model):
    follower = models.ForeignKey(
        User, related_name="following", on_delete=models.CASCADE
    )
    following = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    related_post = models.ForeignKey(
        Post, on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return f"{self.user.username}: {self.message}"


class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField()
    avatar = models.ImageField(upload_to="images/avatar", verbose_name="User pfp")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
