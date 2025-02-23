import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api',
  withCredentials: true
});

// Логин
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Получение постов (добавь токен, если требуется)
export const fetchPosts = async (token?: string) => {
  try {
    const response = await api.get('/posts/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Fetch posts error:', error);
    throw error;
  }
};

// Создание поста
export const createPost = async (content: string, token: string) => {
  try {
    const response = await api.post('/posts/', { content }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

// Уведомления
export const fetchNotifications = async (token: string) => {
  try {
    const response = await api.get('/notifications/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch notifications error:', error);
    throw error;
  }
};

// WebSocket (перенаправь через Nginx)
export const connectWebSocket = (token: string, onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost/api/ws/notifications/?token=${token}`); // Изменил порт
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onclose = () => console.log('WebSocket closed');
  ws.onerror = (error) => console.error('WebSocket error:', error);
  return ws;
};