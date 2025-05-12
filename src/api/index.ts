import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器，自动加 token
apiClient.interceptors.request.use(config => {
  // 判断当前页面是否为后台
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const token = isAdmin
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('user_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应成功，直接返回响应数据
    return response.data;
  },
  (error: AxiosError) => {
    // 处理错误响应
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token');
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