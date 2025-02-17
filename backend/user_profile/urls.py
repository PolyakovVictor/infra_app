from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path("/", views.UserView.as_view(), name="users"),
    path("register", views.UserRegister.as_view(), name="users"),
    path("login", views.UserLogin.as_view(), name="users"),
    # path("profile/", views.profile_view, name="profile_view"),
]
