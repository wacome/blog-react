'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaTags } from 'react-icons/fa';
import PostCard from "@/components/blog/PostCard";
import Pagination from '@/components/common/Pagination';
import { postApi } from '@/api/postApi';
import { tagApi } from '@/api/tagApi';
import type { Post } from '@/types';
import type { Tag } from '@/api/tagApi';

export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    const tag = searchParams.get('tag') || '';
    setSelectedTag(tag);

    setLoading(true);
    Promise.all([
      postApi.getPosts({ page, pageSize: 10, tag }),
      tagApi.getTags()
    ])
    .then(([postRes, tagArr]) => {
      if (postRes.error) {
        throw new Error(postRes.error);
      }
      if (postRes.data) {
        setPosts(postRes.data.posts || []);
        setTotalPages(Math.ceil((postRes.data.total || 0) / 10));
      } else {
        setPosts([]);
        setTotalPages(1);
      }
      setTags(Array.isArray(tagArr) ? tagArr : []);
    })
    .catch(err => {
      setError(err instanceof Error ? err.message : '加载失败');
      setPosts([]);
      setTags([]);
      setTotalPages(1);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/posts?${params.toString()}`);
  };

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tagName === selectedTag) {
      params.delete('tag');
      setSelectedTag('');
    } else {
      params.set('tag', tagName);
      setSelectedTag(tagName);
    }
    params.set('page', '1');
    router.push(`/posts?${params.toString()}`);
  };

  return (
    <div className="w-full min-h-screen px-4 py-12 flex flex-col">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
        {/* 侧边栏 */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-6 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaTags className="mr-2" />
              标签
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(tags) && tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    selectedTag === tag.name
                      ? 'bg-gradient-to-r from-[#d4b483] to-[#a3c293] text-white shadow-md'
                      : 'bg-white/80 text-gray-700 hover:bg-primary/10'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="w-full md:w-[576px]">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : !Array.isArray(posts) || posts.length === 0 ? (
            <div className="text-center py-8">暂无文章</div>
          ) : (
            <div className="space-y-10">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* 分页器：紧贴页面底部，底栏上方，间距很小 */}
          {!loading && Array.isArray(posts) && posts.length > 0 && (
        <div className="flex justify-center mt-16 mb-2">
              <Pagination
                currentPage={Number(searchParams.get('page')) || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
    </div>
  );
} 