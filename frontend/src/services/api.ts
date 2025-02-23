import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api',
  withCredentials: true
});


export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post('/token/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchPosts = async (accessToken: string) => {
  try {
    const response = await api.get('/posts/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('TEST POST RESPONSE: ', response)
    return response;
  } catch (error) {
    console.error('Fetch posts error:', error);
    throw error;
  }
};


export const createPost = async (content: string, accessToken: string) => {
  try {
    const response = await api.post('/posts/', { content }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};


export const fetchNotifications = async (accessToken: string) => {
  try {
    const response = await api.get('/notifications/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch notifications error:', error);
    throw error;
  }
};


export const connectWebSocket = (accessToken: string, onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost/api/ws/notifications/?token=${accessToken}`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onclose = () => console.log('WebSocket closed');
  ws.onerror = (error) => console.error('WebSocket error:', error);
  return ws;
};