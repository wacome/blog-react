'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/userApi";
import { getImageSrc } from '@/utils/getImageSrc';

interface ProfileData {
  username: string;
  nickname: string;
  bio: string;
  avatar: string;
  socialLinks: {
    name: string;
    url: string;
    isExternal?: boolean;
  }[];
}

export default function Banner() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('token');
      if (!token) {
        // 未登录时使用默认数据
        setProfile({
          username: "Toycon",
          nickname: "神谷綺夜",
          bio: "大三学生，喜欢计算机技术、读书等",
          avatar: "/images/avatar.png",
          socialLinks: [
            { name: "博客", url: "/posts" },
            { name: "Github", url: "https://github.com/wacome", isExternal: true },
            { name: "Twitter", url: "https://x.com/WacomTao", isExternal: true },
            { name: "E-mail", url: "mailto:toycon@foxmail.com" },
            { name: "书架", url: "/books" }
          ]
        });
        setLoading(false);
        return;
      }
      try {
        const userData = await getCurrentUser();
        setProfile({
          username: userData.username,
          nickname: userData.nickname || userData.username,
          bio: userData.bio || '欢迎来到我的博客',
          avatar: userData.avatar ? (userData.avatar.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(userData.avatar)}` : userData.avatar) : '/images/avatar.png',
          socialLinks: userData.socialLinks || [
            { name: "博客", url: "/posts", isExternal: false },
            { name: "Github", url: "https://github.com/wacome", isExternal: true },
            { name: "Twitter", url: "https://x.com/WacomTao", isExternal: true },
            { name: "E-mail", url: "mailto:toycon@foxmail.com", isExternal: true },
            { name: "书架", url: "/books", isExternal: false }
          ]
        });
      } catch (error) {
        console.error("获取用户资料失败:", error);
        // 使用默认数据
        setProfile({
          username: "Toycon",
          nickname: "神谷絮夜",
          bio: "大三学生，喜欢计算机技术、读书等",
          avatar: "/images/avatar.png",
          socialLinks: [
            { name: "博客", url: "/posts" },
            { name: "Github", url: "https://github.com/wacome", isExternal: true },
            { name: "Twitter", url: "https://x.com/WacomTao", isExternal: true },
            { name: "E-mail", url: "mailto:toycon@foxmail.com" },
            { name: "书架", url: "/books" }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="card p-6 md:p-8 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden card p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10 z-0">
        <motion.div 
          className="absolute right-0 top-10 w-72 h-48"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 2, 0]
          }}
          transition={{ 
            duration: 8, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "mirror"
          }}
        >
        </motion.div>
        
        <motion.div 
          className="absolute left-10 bottom-10 w-16 h-16 rounded-full bg-primary/20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            ease: "easeInOut", 
            repeat: Infinity,
          }}
        />
        
        <motion.div 
          className="absolute left-40 top-20 w-8 h-8 rounded-full bg-accent/20"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 5, 
            ease: "easeInOut", 
            repeat: Infinity,
            delay: 1
          }}
        />
        
        <motion.div 
          className="absolute right-32 bottom-20 w-12 h-12 rounded-full bg-primary/20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 6, 
            ease: "easeInOut", 
            repeat: Infinity,
            delay: 2
          }}
        />
      </div>

      <div className="w-full md:w-2/3 z-10">
        <motion.h1 
          className="text-2xl md:text-3xl font-bold mb-3 text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ciallo~(∠・ω&lt;)⌒☆
        </motion.h1>
        
        <motion.div
          className="space-y-4 text-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg">这里是 <span className="text-primary font-medium">{profile?.username}</span>，很高兴认识你~</p>
          {profile?.nickname && profile.nickname !== profile.username && (
            <p className="text-lg">也可以叫我 <span className="text-primary font-medium">{profile.nickname}</span></p>
          )}
          {profile?.bio && <p className="text-lg">{profile.bio}</p>}
        </motion.div>
        
        <motion.div 
          className="mt-6 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {profile?.socialLinks.map((link, index) => (
            <motion.div
              key={link.url}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.5 + index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 } 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href={link.url} 
                className={`btn ${link.name === "博客" ? 'btn-primary' : 'btn-secondary'}`}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <motion.div 
        className="w-40 h-40 md:w-56 md:h-56 relative mt-6 md:mt-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.3,
          type: "spring",
          stiffness: 100
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/50 shadow-lg relative">
          <Image
            src={getImageSrc(profile?.avatar || "/images/avatar.png")}
            alt={profile?.username || "用户头像"}
            fill
            className="object-cover"
            priority
          />
          
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-primary/0 to-primary/30"
            animate={{
              opacity: [0, 0.5, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <motion.div
          className="absolute -right-2 top-1/4 w-4 h-4 bg-accent rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
        
        <motion.div
          className="absolute left-0 top-1/2 w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.5
          }}
        />
        
        <motion.div
          className="absolute bottom-5 right-1/4 w-2 h-2 bg-accent rounded-full"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 1
          }}
        />
      </motion.div>
    </div>
  );
} 