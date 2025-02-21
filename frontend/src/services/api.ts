import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Бэкенд на порту 8000
});

export const loginUser = (username: string, password: string) =>
  api.post('/login/', { username, password });

export const registerUser = (username: string, email: string, password: string, passwordRepeat: string) =>
  api.post('/register/', { username, email, password, passwordRepeat});

export const fetchPosts = () => api.get('/posts/');

export const createPost = (content: string, token: string) =>
  api.post('/posts/', { content }, { headers: { Authorization: `Bearer ${token}` } });

export const fetchNotifications = (token: string) =>
  api.get('/notifications/', { headers: { Authorization: `Bearer ${token}` } });