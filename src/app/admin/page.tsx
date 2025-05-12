'use client';

import { useState, useEffect } from 'react';
import { 
  FaFileAlt, 
  FaComments, 
  FaEye, 
  FaTags, 
  FaUserFriends, 
  FaBook,
  FaPen
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { postApi } from '@/api/postApi';
import { commentApi } from '@/api/commentApi';
import { tagApi } from '@/api/tagApi';

interface Stats {
  posts: number;
  comments: number;
  views: number;
  tags: number;
  friends: number;
  books: number;
  hitokoto: number;
}

interface RecentPost {
  id: number;
  title: string;
  views: number;
  date: string;
}

interface RecentComment {
  id: number;
  author: string;
  content: string;
  date: string;
  postId: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    comments: 0,
    views: 0,
    tags: 0,
    friends: 0,
    books: 0,
    hitokoto: 0
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, commentsRes, tagsRes] = await Promise.all([
          postApi.getPosts({ status: 'all' }),
          commentApi.getAllComments(),
          tagApi.getTags()
        ]);

        // 计算统计数据
        const totalViews = (postsRes.data?.posts || []).reduce((sum, post) => sum + post.views, 0);
        setStats({
          posts: postsRes.data?.total || 0,
          comments: Array.isArray(commentsRes) ? commentsRes.length : 0,
          views: totalViews,
          tags: Array.isArray(tagsRes) ? tagsRes.length : 0,
          friends: 0, // 这些数据需要额外的API
          books: 0,
          hitokoto: 0
        });

        // 设置最近文章
        setRecentPosts((postsRes.data?.posts || []).map(post => ({
          id: post.id,
          title: post.title,
          views: post.views,
          date: new Date(post.created_at).toLocaleDateString('zh-CN')
        })));

        // 设置最近评论
        setRecentComments(commentsRes.slice(0, 5).map(comment => ({
          id: comment.id,
          author: comment.author,
          content: comment.content,
          date: new Date(comment.createdAt).toLocaleDateString('zh-CN'),
          postId: comment.postId
        })));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  return (
    <div className="flex flex-col flex-1 w-full min-h-full animate-fade-in bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">控制台</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="文章" 
          value={stats.posts} 
          icon={FaFileAlt} 
          color="bg-blue-500"
          link="/admin/posts"
        />
        <StatCard 
          title="评论" 
          value={stats.comments} 
          icon={FaComments} 
          color="bg-green-500"
          link="/admin/comments"
        />
        <StatCard 
          title="浏览" 
          value={stats.views} 
          icon={FaEye} 
          color="bg-purple-500"
        />
        <StatCard 
          title="标签" 
          value={stats.tags} 
          icon={FaTags} 
          color="bg-yellow-500"
          link="/admin/tags"
        />
      </div>
      
      {/* 最近文章和评论 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* 最近文章 */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">最近文章</h2>
            <Link href="/admin/posts" className="text-sm text-primary hover:underline">
              查看全部
            </Link>
          </div>
          <div className="divide-y flex-1">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3">
                <div className="flex justify-between">
                  <Link href={`/admin/posts/edit/${post.id}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <FaEye className="mr-1" />
                  <span>{post.views} 次浏览</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 最近评论 */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">最近评论</h2>
            <Link href="/admin/comments" className="text-sm text-primary hover:underline">
              查看全部
            </Link>
          </div>
          <div className="divide-y flex-1">
            {recentComments.map((comment) => (
              <div key={comment.id} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium">{comment.author}</span>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                <div className="mt-1">
                  <Link 
                    href={`/admin/posts/${comment.postId}`}
                    className="text-xs text-primary hover:underline"
                  >
                    查看文章
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  link?: string;
}

function StatCard({ title, value, icon: Icon, color, link }: StatCardProps) {
  const content = (
    <motion.div 
      className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center">
        <div className={`${color} rounded-full p-3 text-white`}>
          <Icon />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>
    </motion.div>
  );
  
  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  
  return content;
} 