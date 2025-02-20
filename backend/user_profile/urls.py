from django.urls import path
from . import views

app_name = "user_profile"

urlpatterns = [
    path("users/", views.UserView.as_view(), name="users"),
    path("register", views.RegisterView.as_view(), name="register"),
    path("login", views.LoginView.as_view(), name="login"),
    # path("profile/", views.profile_view, name="profile_view"),
]
