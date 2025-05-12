'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaBook, FaArchive, FaUser, FaComment, FaLink, FaSignInAlt, FaBars, FaListUl } from "react-icons/fa";
import { useState } from "react";
import { getImageSrc } from '@/utils/getImageSrc';
import TOC from '@/components/blog/TOC';

export default function NavBar({ tocContent }: { tocContent?: string }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { name: "首页", path: "/", icon: FaHome },
    { name: "文章", path: "/posts", icon: FaBook },
    { name: "归档", path: "/archive", icon: FaArchive },
    { name: "关于我", path: "/about", icon: FaUser },
    { name: "书架", path: "/books", icon: FaComment },
    { name: "一言", path: "/hitokoto", icon: FaComment },
    { name: "友链", path: "/friends", icon: FaLink },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="container-main py-4">
        {/* 移动端布局 */}
        <div className="flex items-center justify-between md:hidden">
          {tocContent ? (
            // 详情页：左目录按钮，中博客名，右菜单
            <>
              {/* 左：目录按钮 */}
              <button
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setShowToc(true)}
                aria-label="Show TOC"
              >
                <FaListUl className="h-6 w-6" />
              </button>
              {/* 中：博客名 */}
              <div className="flex-1 text-center">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent select-none">Toycon</span>
              </div>
              {/* 右：菜单按钮 */}
              <button
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <FaBars className="h-6 w-6" />
              </button>
            </>
          ) : (
            // 其他页面：左头像+博客名，右菜单
            <>
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image 
                    src={getImageSrc("/images/avatar.png")}
                    alt="Toycon" 
                    width={32} 
                    height={32}
                    className="object-cover"
                    priority
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent select-none">Toycon</span>
              </Link>
              <button
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <FaBars className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
        {/* 桌面端布局 */}
        <div className="hidden md:flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image 
                src={getImageSrc("/images/avatar.png")}
                alt="Toycon" 
                width={32} 
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Toycon
            </span>
          </Link>
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-link ${active ? "text-primary" : ""} flex items-center`}
                >
                  <item.icon className="mr-1" size={14} />
                  <span>{item.name}</span>
                  {active && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                      layoutId="navbar-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <Link href="/login" className="btn btn-outline-primary flex items-center">
            <FaSignInAlt className="mr-2" />
            登录
          </Link>
        </div>
        {/* 移动端菜单，带收起动画 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-2 space-y-1 overflow-hidden">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        active 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="mr-3" size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/login"
                  className="flex items-center px-4 py-2 text-primary hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaSignInAlt className="mr-3" size={16} />
                  <span>登录</span>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
      {/* 移动端 TOC 抽屉，仅详情页显示 */}
      <AnimatePresence>
        {tocContent && showToc && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 flex justify-center items-start pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowToc(false)}
          >
            <motion.div
              className="bg-white/95 rounded-2xl shadow-xl w-[90vw] max-w-xs p-4 relative"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowToc(false)} aria-label="关闭目录">×</button>
              <TOC content={tocContent} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 