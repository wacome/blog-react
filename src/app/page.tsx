'use client';

import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaTag, FaEye } from 'react-icons/fa';
import PostCard from "@/components/blog/PostCard";
import Banner from "@/components/home/Banner";
import { useEffect, useState } from 'react';
import { postApi } from '@/api/postApi';
import { Post } from '@/types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const { data, error } = await postApi.getPosts();

        if (error) {
          throw new Error(error);
        }

        if (!data) {
          throw new Error('获取文章列表失败');
        }

        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取文章列表失败");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <div className="animate-slide-up">
      <Banner />
      
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-primary pl-3">
          最新文章
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center">暂无文章</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/posts"
            className="btn btn-primary inline-flex items-center"
          >
            查看更多文章
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
          >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
