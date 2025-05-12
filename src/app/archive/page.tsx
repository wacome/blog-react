'use client';
import { useEffect, useState } from 'react';
import { postApi } from '@/api/postApi';
import type { Post } from '@/types';

export default function ArchivePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await postApi.getPosts({ page: 1, pageSize: 1000 });

        if (error) {
          throw new Error(error);
        }

        if (data) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // 按年份分组文章
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.created_at).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<number, Post[]>);

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <span className="block w-1 h-10 bg-[#6b88a6] rounded-sm mr-3"></span>
        <span className="bg-gradient-to-r from-[#d4b483] to-[#a3c293] bg-clip-text text-transparent">文章归档</span>
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">暂无文章</div>
      ) : (
        <div className="space-y-8">
          {years.map(year => (
            <div key={year}>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="block w-1 h-7 bg-[#6b88a6] rounded-sm mr-2"></span>
                <span className="bg-gradient-to-r from-[#d4b483] to-[#a3c293] bg-clip-text text-transparent">{year}</span>
              </h2>
              <div className="space-y-4">
                {postsByYear[Number(year)].map(post => (
                  <article key={post.id} className="bg-white/60 rounded-lg shadow-md p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
                    <h3 className="text-xl font-semibold mb-2">
                      <a href={`/posts/${post.id}`} className="text-gray-900 hover:text-primary">
                        {post.title}
                      </a>
                    </h3>
                    <div className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}