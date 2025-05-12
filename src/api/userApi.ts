import { api, ApiResponse } from './api';

// 用户相关的接口类型定义
export interface User {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    name: string;
    url: string;
    isExternal?: boolean;
  }[];
  role?: 'admin' | 'user';
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
  const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials);
  return res.data.data;
}

// 用户登出
export function logout(): void {
  localStorage.removeItem('token');
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<User> {
  const res = await api.get<ApiResponse<User>>('/users/me');
  return res.data.data;
}

// 更新用户资料
export async function updateProfile(userData: Partial<User>): Promise<User> {
  const res = await api.put<ApiResponse<User>>('/users/me', userData);
  return res.data.data;
}

// 上传头像
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post<ApiResponse<{ url: string }>>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
} 