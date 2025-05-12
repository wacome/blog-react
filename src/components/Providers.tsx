'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { BlogProvider } from '@/contexts/BlogContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <BlogProvider>
        {/* 这里可以添加全局状态提供者，例如主题、身份验证等 */}
        {children}
      </BlogProvider>
    </AuthProvider>
  );
} 