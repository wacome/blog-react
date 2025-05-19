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
  const coverImage = post.cover || post.cover_image || post.coverImage || 'https://blog-1257292087.cos.ap-nanjing.myqcloud.com/content-cover.jpg';

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
        <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-700 gap-1 md:gap-2 mb-3 md:mb-4">
          {/* 作者头像 */}
          <span className="w-6 h-6 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={post.author?.avatar || '/images/avatar.png'}
              alt={post.author?.name || (typeof post.author === 'string' && post.author) || '作者头像'}
              fill
              className="object-cover"
            />
          </span>
          {/* 作者昵称 */}
          <span className="font-medium ml-[1px]">
            {post.author?.name || (typeof post.author === 'string' && post.author) || '佚名'}
          </span>
          {/* 原创/转载标识 */}
          {(post.authorType === 'original' || post.authorType === 'repost') && (
            <span className={
              'inline-block px-2 py-0.5 rounded align-middle text-xs ml-1 ' +
              (post.authorType === 'original'
                ? 'bg-green-200 text-green-800'
                : 'bg-yellow-200 text-yellow-800')
            }>
              {post.authorType === 'original' ? '原创' : '转载'}
            </span>
          )}
          {/* 日期 */}
          <span className="flex items-center ml-2">
            <FaCalendarAlt className="mr-1" />
            {(() => {
              const date = post.created_at || post.updated_at || post.date;
              return date ? new Date(date).toLocaleDateString('zh-CN') : '';
            })()}
          </span>
          {/* 浏览数 */}
          <span className="flex items-center ml-2">
            <FaEye className="mr-1" />
            <span>{post.views}</span>
          </span>
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