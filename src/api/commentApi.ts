import { api, ApiResponse } from './api';

// 评论相关的接口类型定义
export interface Comment {
  id: number;
  author: string;
  content: string;
  email: string;
  website?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
  // 兼容后端下划线字段
  created_at?: string;
  updated_at?: string;
}

export interface CommentInput {
  author: string;
  content: string;
  email: string;
  website?: string;
  avatar?: string;
  parent_id?: number;
}

export const commentApi = {
  // 获取所有评论
  async getAllComments(): Promise<Comment[]> {
    try {
      const response = await api.get<ApiResponse<Comment[]>>('/comments');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取评论失败');
    }
  },

  // 获取文章评论
  async getComments(postId: number): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`);
    return response.data.data;
  },

  // 创建评论
  async createComment(postId: number, comment: CommentInput): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, comment);
    return response.data.data;
  },

  // 删除评论
  async deleteComment(commentId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/comments/${commentId}`);
  },

  // 获取待审核评论（管理员）
  async getPendingComments(): Promise<Comment[]> {
    return await api.get<ApiResponse<Comment[]>>('/admin/comments/pending').then(response => response.data.data);
  },

  // 审核评论（管理员）
  async approveComment(commentId: number): Promise<Comment> {
    const response = await api.put<ApiResponse<Comment>>(`/comments/${commentId}/approve`);
    return response.data.data;
  }
}; 