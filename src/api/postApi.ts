import apiClient from './index';
import type { Post } from '@/types';

export interface GetPostsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: string;
  tag?: string;
  status?: 'draft' | 'published' | 'all';
}

export interface GetPostsResponse {
  limit: number;
  page: number;
  posts: Post[];
  sort_by: string;
  sort_order: 'asc' | 'desc';
  total: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const postApi = {
  // 获取文章列表
  getPosts: async (params: GetPostsParams = {}) => {
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc', search = '', category = '', tag = '', status = 'published' } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      sort_by: sortBy,
      sort_order: sortOrder,
      search,
      category,
      tag,
      status,
    });
    try {
      const response = await apiClient.get<ApiResponse<GetPostsResponse>>(`/posts?${queryParams}`);
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '获取文章列表失败' };
    }
  },

  // 获取单个文章详情
  getPost: async (id: number) => {
    try {
      const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '获取文章详情失败' };
    }
  },

  // 创建文章
  createPost: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author' | 'view_count' | 'like_count' | 'comment_count'>) => {
    try {
      const data = await apiClient.post<Post>('/posts', post);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '创建文章失败' };
    }
  },

  // 更新文章
  updatePost: async (id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author' | 'view_count' | 'like_count' | 'comment_count'>>) => {
    try {
      const data = await apiClient.put<Post>(`/posts/${id}`, post);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '更新文章失败' };
    }
  },

  // 删除文章
  deletePost: async (id: number) => {
    try {
      await apiClient.delete(`/posts/${id}`);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : '删除文章失败' };
    }
  },

  // 批量删除文章
  batchDeletePosts: async (ids: number[]) => {
    try {
      await apiClient.post('/posts/batch-delete', { ids });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : '批量删除文章失败' };
    }
  },

  // 上传文章封面
  uploadPostCover: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post('/posts/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 点赞文章
  likePost: async (id: number): Promise<void> => {
    await apiClient.post(`/posts/${id}/like`);
  },
}; 