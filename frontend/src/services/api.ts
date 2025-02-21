import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const loginUser = (username: string, password: string) =>
  api.post('/login/', { username, password });

export const fetchPosts = () => api.get('/posts/');

export const createPost = (content: string, token: string) =>
  api.post('/posts/', { content }, { headers: { Authorization: `Bearer ${token}` } });

export const fetchNotifications = (token: string) =>
  api.get('/notifications/', { headers: { Authorization: `Bearer ${token}` } });

export const connectWebSocket = (token: string, onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onclose = () => console.log('WebSocket closed');
  return ws;
};