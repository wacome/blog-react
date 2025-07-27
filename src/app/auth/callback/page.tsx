'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getCurrentUser } from '@/api/userApi';

function AuthCallbackContent() {
  const router = useRouter();
  const { setUser } = useUser();
  const jumpedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (jumpedRef.current) return;
      jumpedRef.current = true;
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        const returnUrl = localStorage.getItem('returnUrl') || '/';
        console.log('auth callback returnUrl:', returnUrl);
        localStorage.removeItem('returnUrl');
        router.replace(returnUrl);
      } catch (error) {
        router.replace('/');
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