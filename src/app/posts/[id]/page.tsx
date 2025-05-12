'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaEye, FaUser, FaListUl } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AnimatedTag from '@/components/blog/AnimatedTag';
import MarkdownIt from 'markdown-it';
import MarkdownItPrism from 'markdown-it-prism';
import { postApi } from '@/api/postApi';
import { commentApi } from '@/api/commentApi';
import CommentSection from '@/components/blog/CommentSection';
import TOC from '@/components/blog/TOC';
import BackToTopButton from '@/components/common/BackToTopButton';
import ShareButton from '@/components/common/ShareButton';
import { getImageSrc } from '@/utils/getImageSrc';
import NavBar from '@/components/layout/NavBar';
import html2canvas from 'html2canvas';
import ShareCard from '@/components/common/ShareCard';

// 为缺少类型声明的模块创建声明
declare module 'markdown-it-prism';

// 初始化markdown解析器
const md = new MarkdownIt().use(MarkdownItPrism);
// 自定义图片渲染器，外链图片自动代理
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  let src = token.attrGet('src');
  if (src && src.startsWith('http')) {
    token.attrSet('src', `/api/proxy-image?url=${encodeURIComponent(src)}`);
  }
  // 添加美化样式
  let cls = token.attrGet('class');
  const beautify = 'mx-auto my-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-full';
  token.attrSet('class', cls ? cls + ' ' + beautify : beautify);
  return self.renderToken(tokens, idx, options);
};

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  views: number;
  comments?: Comment[];
}

interface PostParams {
  params: {
    id: string;
  };
}

function TocButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-primary/80 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 backdrop-blur-lg border border-white/20"
      aria-label="目录"
    >
      <FaListUl className="w-6 h-6" />
    </button>
  );
}

export default function PostDetail({ params }: PostParams) {
  const { id } = params;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        const [postRes, commentRes] = await Promise.all([
          postApi.getPost(Number(id)),
          commentApi.getComments(Number(id))
        ]);
        if (postRes.error) throw new Error(postRes.error);
        setPost(postRes.data);
        setComments(commentRes);
      } catch (e: any) {
        if (e.response) {
          setError(e.response.data.message || '获取文章详情失败');
        } else {
          setError(e.message || '获取文章详情失败');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === 'undefined') return;
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const docH = document.body.scrollHeight;
      setShowShare(scrollY + winH >= docH - 40);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!commentRef.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setShowShare(entry.isIntersecting),
      { root: null, threshold: 0.1 }
    );
    observer.observe(commentRef.current);
    return () => observer.disconnect();
  }, [commentRef.current]);

  if (loading) {
    return <div className="container-main py-12 text-center">加载中...</div>;
  }
  if (error || !post) {
    return <div className="container-main py-12 text-center text-red-500">{error || '文章不存在'}</div>;
  }

  // 获取封面图片 URL
  const coverImage = post.cover || post.cover_image || post.coverImage || '/images/default-cover.jpg';

  return (
    <>
      {/* PC端左侧悬浮目录 */}
      {!isMobile && <TOC content={post.content} />}
      {/* 右下角按钮 */}
      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-3 z-50">
        {isMobile && <TocButton onClick={() => setShowToc(true)} />}
        <div className={`${isMobile ? '' : 'w-16 h-16 md:w-[69px] md:h-18'}`}> 
          <ShareButton show={!isMobile || showShare} post={post} />
        </div>
        <div className={`${isMobile ? '' : 'w-12 h-12 md:w-14 md:h-14'}`}> 
          <BackToTopButton noFixed={isMobile} />
        </div>
      </div>
      {/* 移动端 TOC 抽屉 */}
      {isMobile && showToc && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center"
          onClick={() => setShowToc(false)}
        >
          <div
            className="bg-gradient-to-br from-white/95 via-[#f3f6fa]/90 to-[#e9eefd]/80 rounded-3xl shadow-2xl border border-[#e5e7eb]/60 w-[92vw] max-w-sm p-6 relative flex flex-col items-center animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex flex-col items-center text-center">
              <TOC 
                content={post.content} 
                className="w-full bg-transparent shadow-none p-0 max-w-full static relative text-center
                  [&_ol]:space-y-4
                  [&_ol]:mt-4
                  [&_li]:rounded-xl
                  [&_li]:transition
                  [&_li]:hover:bg-[#f3f6fa]
                  [&_a]:py-2
                  [&_a]:text-base
                  [&_a]:font-medium
                  [&_a]:transition
                  [&_a]:rounded-xl
                  [&_a]:active:scale-95
                  "
              />
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center py-8">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-xl overflow-hidden">
              <img 
                src={getImageSrc(coverImage)} 
                alt={post.title} 
                className="w-full h-64 object-cover rounded-lg shadow-lg" 
                onError={e => { (e.target as HTMLImageElement).src = '/images/default-cover.jpg'; }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <motion.h1 
                  className="text-2xl md:text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {post.title}
                </motion.h1>
                <motion.div 
                  className="flex flex-wrap md:flex-nowrap items-center text-white/80 text-sm md:space-x-4 space-x-2 md:space-x-4 space-y-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    <span className="flex items-center">
                      <span className="w-6 h-6 relative rounded-full overflow-hidden mr-2">
                        <Image
                          src={post.author?.avatar || '/images/avatar.png'}
                          alt={typeof post.author === 'object' && post.author?.name ? post.author.name : (typeof post.author === 'string' ? post.author : '作者头像')}
                          fill
                          className="object-cover"
                        />
                      </span>
                      {typeof post.author === 'object' && post.author?.name
                        ? post.author.name
                        : (typeof post.author === 'string' && post.author)
                          ? post.author
                          : (post.author_name || '佚名')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {(() => {
                      const date = post.published_at || post.publishedAt || post.created_at || post.createdAt || post.updated_at || post.updatedAt;
                      return date ? new Date(date).toLocaleDateString('zh-CN') : '';
                    })()}
                  </div>
                  <div className="flex items-center">
                    <FaEye className="mr-2" />
                    {post.views} 次浏览
                  </div>
                </motion.div>
                <motion.div 
                  className="flex flex-wrap mt-4 gap-2 text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {Array.isArray(post.tags) && post.tags.map((tag: any, index: number) => (
                    <span key={`${post.id}-${typeof tag === 'string' ? tag : tag.name}-${index}`}
                          className="inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm">
                      <svg className="w-4 h-4 mr-1 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zm7.5-5a5 5 0 100 10A5 5 0 0010 5z"></path></svg>
                      {typeof tag === 'string' ? tag : tag.name}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
            <motion.div 
              className="card p-6 md:p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ 
                  __html: md.render(post.content || '') 
                }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div ref={commentRef}>
                <CommentSection postId={post.id} comments={comments} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 