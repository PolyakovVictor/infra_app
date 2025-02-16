from django.urls import path
from . import views

app_name = "user_profile"

urlpatterns = [
    path("users/", views.user_list, name="user_list"),
    path("profile/", views.profile_view, name="profile_view"),
]
