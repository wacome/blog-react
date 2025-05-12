'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, login as apiLogin, logout as apiLogout, getCurrentUser } from '@/api/userApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查用户是否已登录（在客户端组件初始化时）
  useEffect(() => {
    const checkAuthStatus = async () => {
      // 检查本地存储中是否有token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // 获取当前用户信息
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        // 如果获取用户信息失败，清除token
        localStorage.removeItem('token');
        setError('会话已过期，请重新登录');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // 登录方法
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin({ email, password });
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查邮箱和密码');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    apiLogout();
    setUser(null);
    setError(null);
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 创建自定义Hook，便于在组件中使用
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 