'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        // 获取之前保存的返回 URL
        const returnUrl = localStorage.getItem('returnUrl');
        // 清除保存的 URL
        localStorage.removeItem('returnUrl');
        // 重定向到之前的页面或首页
        router.push(returnUrl || '/');
      } catch (error) {
        console.error('解析用户信息失败:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">正在处理登录...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
} 