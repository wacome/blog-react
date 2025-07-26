'use client';

import Link from 'next/link';
import { FaTag } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface AnimatedTagProps {
  name: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function AnimatedTag({ name, count, size = 'md', onClick }: AnimatedTagProps) {
  // 根据size确定样式
  const tagSizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  // 基础样式
  const baseClass = `inline-flex items-center rounded-full bg-accent/30 text-accent-foreground transition-all duration-300 hover:bg-accent/50 ${tagSizeClasses[size]}`;
  
  const containerVariants = {
    initial: { 
      scale: 0.8, 
      opacity: 0 
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95 
    }
  } as const;
  
  const content = (
    <motion.span
      className={baseClass}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
    >
      <FaTag className="mr-1" size={size === 'lg' ? 14 : (size === 'md' ? 12 : 10)} />
      <span>{name}</span>
      {count !== undefined && (
        <span className="ml-1.5 bg-accent/40 px-1.5 py-0.5 rounded-full text-xs">
          {count}
        </span>
      )}
    </motion.span>
  );
  
  // 如果有onClick处理函数，返回button
  if (onClick) {
    return (
      <button onClick={onClick} className="mr-2 mb-2">
        {content}
      </button>
    );
  }
  
  // 否则返回链接
  const tagName = typeof name === 'object' && name !== null ? ((name as any).name ?? (name as any).id ?? String(name)) : String(name);
  return (
    <Link href={`/tags/${encodeURIComponent(tagName)}`} className="mr-2 mb-2">
      {content}
    </Link>
  );
} 