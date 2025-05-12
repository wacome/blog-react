'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { postApi } from '@/api/postApi';
import type { Post } from '@/types';

interface BlogContextType {
  posts: Post[];
  featuredPosts: Post[];
  loading: boolean;
  error: string;
  refreshPosts: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await postApi.getPosts({ page: 1, pageSize: 10 });

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

  const loadFeaturedPosts = async () => {
    try {
      const { data, error } = await postApi.getPosts({ page: 1, pageSize: 5 });

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setFeaturedPosts(data.posts);
      } else {
        setFeaturedPosts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      setFeaturedPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
    loadFeaturedPosts();
  }, []);

  const refreshPosts = async () => {
    await Promise.all([loadPosts(), loadFeaturedPosts()]);
  };

  return (
    <BlogContext.Provider value={{ posts, featuredPosts, loading, error, refreshPosts }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
} 