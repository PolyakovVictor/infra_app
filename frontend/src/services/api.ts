import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Post } from '../features/postsSlice';


const api = axios.create({
  baseURL: 'http://localhost',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor for add access token to every request 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !config.url?.includes('/token')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// interceptor for proccess update access token
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    token ? resolve(token) : reject(error);
  });
  failedQueue = [];
};

const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          handleLogout();
          return Promise.reject(new Error('No refresh token available'));
        }

        const { data } = await api.post<{ access: string }>('/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;
        localStorage.setItem('accessToken', newAccessToken);

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post<{ access: string; refresh: string }>('/api/token/', { 
      username, 
      password 
    });
    console.log('RESPONST: ', response)
    const { access, refresh } = response;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchPosts = async () => {
  try {
    const response = await api.get<Post[]>('/api/posts/');
    return response.data;
  } catch (error) {
    console.error('Fetch posts error:', error);
    throw error;
  }
};

export const createPost = async (content: string) => {
  try {
    const response = await api.post<Post>('/api/posts/', { content });
    return response.data;
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

export const fetchNotifications = async () => {
  try {
    const response = await api.get<any>('/api/notifications/');
    return response.data;
  } catch (error) {
    console.error('Fetch notifications error:', error);
    throw error;
  }
};

export const connectWebSocket = (onMessage: (data: any) => void) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const ws = new WebSocket(`ws://localhost/api/ws/notifications/?token=${accessToken}`);
  
  ws.onopen = () => console.log('WebSocket connected');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onclose = () => console.log('WebSocket closed');
  ws.onerror = (error) => console.error('WebSocket error:', error);
  
  return ws;
};

export const followToUser = async (post: Post) => {
  try {
    const response = await api.post('/api/follow/', { user_id: post.user });
    return response.data;
  } catch (error) {
    console.log('Following error:', error);
    throw error;
  }
};

export const fetchUserProfile = async (user: string) => {
  try {
    const response = await api.get('/api/profile/', {params: { user }});
    return response.data;
  } catch (error) {
    console.log('Get User Profile error:', error);
    throw error;
  }
};


export const fetchUserPosts = async (user: string) => {
  try {
    const response = await api.get('/api/user-posts/', {params: { user }});
    return response.data;
  } catch (error) {
    console.log('Get User Profile error:', error);
    throw error;
  }
};


export const updateUserProfile = async (data: { bio?: string; avatar?: string }) => {
  try {
    const response = await api.patch('/api/profile/', data);
    return response.data;
  } catch (error) {
    console.log('Update User Profile error:', error);
    throw error;
  }
};


export const fetchCurrentUser = async () => {
  try{
    const response = await api.get('/api/current-user/')
    return response.data;
  } catch (error) {
    console.log('Fail to get current', error)
    throw error;
  }
}

export const likePost = async (postId: number) => {
  try {
    const response = await api.post(`/api/posts/${postId}/like/`, {});
    return response.data;
  } catch (error) {
    console.log('Fail to get current', error)
    throw error;
  }
};

export const repostPost = async (postId: number) => {
  try {
    const response = await api.post(`/api/posts/${postId}/repost/`, {});
    return response.data;
  } catch (error) {
    console.log('Fail to get current', error)
    throw error;
  }
};

export default api;
