'use client';

import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaTag, FaEye } from 'react-icons/fa';
import { motion } from "framer-motion";
import AnimatedTag from "./AnimatedTag";
import type { Post } from '@/types';
import { getImageSrc } from '@/utils/getImageSrc';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // 获取封面图片 URL
  const coverImage = post.cover || post.cover_image || post.coverImage || '/images/default-cover.jpg';

  return (
    <motion.article 
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/posts/${post.id}`}>
        <div className="relative h-48 md:h-56 overflow-hidden">
          <Image
            src={getImageSrc(coverImage)}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <h2 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">
              {post.title}
            </h2>
          </div>
        </div>
      </Link>
      
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-500 gap-4 md:gap-6 mb-3 md:mb-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <FaCalendarAlt className="mr-1" />
            <span>{post.date}</span>
          </motion.div>
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <FaEye className="mr-1" />
            <span>{post.views}</span>
          </motion.div>
        </div>
        
        <motion.p 
          className="text-gray-700 text-sm md:text-base mb-4 md:mb-5 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {post.excerpt}
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap gap-2 text-xs md:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {post.tags.map((tag: any, index: number) => (
            <AnimatedTag
              key={`${post.id}-${tag.id ?? tag.name ?? tag}-${index}`}
              name={typeof tag === 'object' && tag !== null ? (tag.name ?? tag.slug ?? String(tag)) : String(tag)}
              size="sm"
              count={tag.count}
            />
          ))}
        </motion.div>
      </div>
    </motion.article>
  );
} 