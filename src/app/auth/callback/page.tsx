'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { userApi } from '@/api/userApi';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useUser();
  const [message, setMessage] = useState('正在验证您的身份，请稍候...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // 调用后端的 /me 接口，这个接口会利用 cookie 中的 auth_token 来验证用户
        const userData = await userApi.getMe();
        
        if (userData) {
          // 1. 更新全局用户状态
          setUser(userData);
          // 2. 将用户信息存入 localStorage 以便持久化
          localStorage.setItem('user', JSON.stringify(userData));
          
          setMessage('登录成功！正在跳转...');

          // 3. 从 localStorage 读取登录前保存的 URL，然后跳转回去
          const returnUrl = localStorage.getItem('loginReturnUrl') || '/';
          localStorage.removeItem('loginReturnUrl'); // 用完后就删除
          router.replace(returnUrl);
        } else {
          throw new Error('无法获取用户信息。');
        }
      } catch (err) {
        console.error('GitHub callback error:', err);
        setError('验证失败，请重新登录。');
        // 几秒后跳回首页
        setTimeout(() => router.replace('/'), 3000);
      }
    };

    verifyUser();
  }, [router, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white shadow-md rounded-lg">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}