import { api } from './api';

// 标签相关的接口类型定义
export interface Tag {
  id: number;
  name: string;
  slug: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagInput {
  name: string;
  slug: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const tagApi = {
  // 获取所有标签
  async getTags(): Promise<Tag[]> {
    try {
      const response = await api.get<ApiResponse<Tag[]>>('/tags');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取标签失败');
    }
  },

  // 获取单个标签
  getTag: async (id: number | string): Promise<Tag> => {
    const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data;
  },

  // 创建标签
  async createTag(data: { name: string; slug: string }): Promise<Tag> {
    try {
      const response = await api.post<ApiResponse<Tag>>('/tags', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建标签失败');
    }
  },

  // 更新标签
  async updateTag(id: number, data: Partial<Tag>): Promise<Tag> {
    try {
      const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新标签失败');
    }
  },

  // 删除标签
  async deleteTag(id: number): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/tags/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除标签失败');
    }
  },

  // 获取标签下的文章
  getPostsByTag: async (slug: string, page = 1, limit = 10): Promise<{ tag: Tag; posts: any[] }> => {
    const params = { page, limit };
    const response = await api.get<ApiResponse<{ tag: Tag; posts: any[] }>>(`/tag-slug/${slug}/posts`, { params });
    return response.data.data;
  },
}; 