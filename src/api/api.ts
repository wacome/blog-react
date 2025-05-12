import axios from 'axios';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true, // 允许跨域请求携带cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 cookie 中获取 token
    const cookies = document.cookie.split(';');
    const authToken = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authToken) {
      const token = authToken.split('=')[1];
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除用户状态并跳转到登录页
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 