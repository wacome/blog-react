'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function PostsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* 文章列表专属背景图 */}
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: 'url(https://blog-1257292087.cos.ap-nanjing.myqcloud.com/posts-bg.png)' }} />
      <motion.div 
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
} 