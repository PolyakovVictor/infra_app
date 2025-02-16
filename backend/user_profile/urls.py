from django.urls import path
from . import views

app_name = "user_profile"

urlpatterns = [
    path("users/", views.UserView.as_view(), name="users"),
    # path("profile/", views.profile_view, name="profile_view"),
]
