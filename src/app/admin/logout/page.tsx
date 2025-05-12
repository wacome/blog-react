'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem('admin_token');
    router.replace('/');
  }, [router]);
  return null;
} 