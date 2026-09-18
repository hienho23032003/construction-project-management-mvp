import axios from 'axios';

export const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost')
      ? import.meta.env.VITE_API_BASE_URL
      : '/api')
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5047/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 Unauthorized & standardize Vietnamese error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('permissions');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.data?.title) {
      error.message = error.response.data.title;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
