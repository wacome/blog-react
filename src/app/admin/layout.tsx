'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaFileAlt, 
  FaComments, 
  FaTags, 
  FaUserFriends,
  FaBook,
  FaQuoteRight,
  FaImage,
  FaSignOutAlt
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: '控制台', icon: FaTachometerAlt, path: '/admin' },
    { name: '文章管理', icon: FaFileAlt, path: '/admin/posts' },
    { name: '评论管理', icon: FaComments, path: '/admin/comments' },
    { name: '标签管理', icon: FaTags, path: '/admin/tags' },
    { name: '友链管理', icon: FaUserFriends, path: '/admin/friends' },
    { name: '图书管理', icon: FaBook, path: '/admin/books' },
    { name: '一言管理', icon: FaQuoteRight, path: '/admin/hitokoto' },
    { name: '图片管理', icon: FaImage, path: '/admin/images' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-white shadow-md transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-primary md:hidden">
            博客管理
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path} className="px-2 py-1">
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-3 ${
                      isActive
                        ? 'bg-primary text-white rounded-md'
                        : 'text-gray-600 hover:bg-gray-100 rounded-md'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`${sidebarOpen ? '' : 'md:mx-auto'}`} />
                    <span className={`ml-4 ${sidebarOpen ? '' : 'md:hidden'}`}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
            <li className="px-2 py-1 mt-5">
              <Link
                href="/admin/logout"
                className="flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-md"
                onClick={() => setSidebarOpen(false)}
              >
                <FaSignOutAlt className={`${sidebarOpen ? '' : 'md:mx-auto'}`} />
                <span className={`ml-4 ${sidebarOpen ? '' : 'md:hidden'}`}>退出登录</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-20'
        }`}
      >
        {/* 移动端顶部栏 */}
        <div className="md:hidden bg-white shadow-sm">
          <div className="flex items-center h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-bold text-primary">
              博客管理
            </h1>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 