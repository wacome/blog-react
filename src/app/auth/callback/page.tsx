'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getCurrentUser } from '@/api/userApi';

function AuthCallbackContent() {
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 获取用户信息
        const userData = await getCurrentUser();
        
        // 更新用户状态
        setUser(userData);

        // 获取之前保存的返回 URL
        const returnUrl = localStorage.getItem('returnUrl');
        // 清除保存的 URL
        localStorage.removeItem('returnUrl');
        // 重定向到之前的页面或首页
        router.push(returnUrl || '/');
      } catch (error) {
        console.error('获取用户信息失败:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router, setUser]);

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