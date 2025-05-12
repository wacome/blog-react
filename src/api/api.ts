import axios from 'axios';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 判断当前页面是否为后台
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const token = isAdmin
      ? localStorage.getItem('admin_token')
      : localStorage.getItem('user_token');
    if (token) {
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
      // 判断当前页面是否为后台
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (isAdmin) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      } else {
        localStorage.removeItem('user_token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
); 