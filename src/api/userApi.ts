import apiClient from './index';

// 通用 API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 用户相关的接口类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  nickname?: string;
  socialLinks?: {
    name: string;
    url: string;
    isExternal?: boolean;
  }[];
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UserProfileInput {
  username?: string;
  avatar?: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
}

// 用户登录
export async function login(credentials: LoginInput): Promise<{ token: string; user: User }> {
  const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials);
  return res.data;
}

// 用户登出
export function logout(): void {
  localStorage.removeItem('token');
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<User> {
  return await apiClient.get('/users/me');
}

// 更新用户资料
export async function updateProfile(userData: Partial<User>): Promise<User> {
  return await apiClient.put('/users/me', userData);
}

// 上传用户头像
export async function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const formData = new FormData();
  formData.append('avatar', file);
  return await apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
} 