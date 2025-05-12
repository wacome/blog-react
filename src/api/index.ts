import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true, // 允许跨域请求携带cookie
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => {
    // 如果响应成功，直接返回响应数据
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response?.status === 401) {
      // 未授权，清除用户状态并跳转到登录页
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 创建自定义类型 - 返回数据直接是API返回的数据类型而不是AxiosResponse
export default apiClient as {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
  patch<T>(url: string, data?: any, config?: any): Promise<T>;
}; 