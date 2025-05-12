import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import "../../styles/font.css";
import "../../styles/lxgwwenkai.css";
import { Providers } from "@/components/Providers";
import ClientLayoutShell from './layoutClient';
import { UserProvider } from '@/contexts/UserContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Toycon的博客",
  description: "一个记录学习和生活的个人博客",
  icons: {
    icon: '/images/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="img-src 'self' data: blob: http://localhost:3000 http://localhost:8080 https://cdn.jsdelivr.net;"
        />
      </head>
      <body className={inter.variable}>
        <UserProvider>
          <Providers>
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </Providers>
        </UserProvider>
      </body>
    </html>
  );
}
