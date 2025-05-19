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
  title: '博客',
  description: '个人博客',
  icons: {
    icon: 'https://blog-1257292087.cos.ap-nanjing.myqcloud.com/favicon.ico',
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
          content="img-src 'self' data: blob: http://localhost:3000 http://localhost:8080 https://cdn.jsdelivr.net https://tse2-mm.cn.bing.net https://images.unsplash.com https://img1.doubanio.com https://img.picui.cn https://qlogo.cn https://p.qlogo.cn https://picx.zhimg.com https://pic1.zhimg.com https://pic2.zhimg.com https://pic3.zhimg.com https://pic4.zhimg.com https://pic5.zhimg.com https://pic6.zhimg.com https://pic7.zhimg.com https://pic8.zhimg.com https://pic9.zhimg.com https://i.loli.net https://s1.ax1x.com https://user-images.githubusercontent.com https://raw.githubusercontent.com https://avatars.githubusercontent.com https://files.catbox.moe https://pbs.twimg.com https://media.istockphoto.com https://images.pexels.com https://images.unsplash.com https://lh3.googleusercontent.com https://cdn.jsdelivr.net https://blog-1257292087.cos.ap-nanjing.myqcloud.com;"
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
