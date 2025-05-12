'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import React from 'react';

const NavBar = dynamic(() => import('@/components/layout/NavBar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isPostDetail = /^\/posts\/[\w-]+$/.test(pathname);
  const isArchive = pathname.startsWith('/archive');
  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <NavBar />}
      <main className={
        isAdmin
          ? "flex-1 w-full min-h-full bg-gray-50"
          : isPostDetail || isArchive
            ? "flex-grow py-8 animate-fade-in"
            : "flex-grow container-main py-8 animate-fade-in"
      }>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
} 