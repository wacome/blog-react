'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User as ApiUser } from '@/api/userApi';
import { userApi } from '@/api/userApi';

interface UserContextType {
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true, // 初始时设置为正在加载
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 尝试从 localStorage 获取缓存的用户信息
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // 无论 localStorage 中是否有，都去后端验证一次最新的用户信息
        // 这能确保用户信息的实时性（比如头像更新了），并验证 cookie 是否依然有效
        const freshUser = await userApi.getMe();
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } else {
          // 如果API返回空，说明cookie无效或过期，此时应该登出
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        // 请求 /me 接口失败，通常意味着用户未登录
        console.log('Not logged in or session expired.');
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false); // 加载完成
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);