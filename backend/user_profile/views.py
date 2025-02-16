from django.shortcuts import render

from .serializers import UserSerializer, UserCreateSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()


class UserList(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def get_serializer_class(self):
        if self.action == 'create':  # Если это POST запрос (создание)
            return UserCreateSerializer  # Используем сериализатор с паролем
        return UserSerializer
