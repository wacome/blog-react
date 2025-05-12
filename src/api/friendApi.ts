import apiClient from './index';

export interface Friend {
  id: number;
  name: string;
  url: string;
  avatar?: string;
  desc?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const friendApi = {
  async getFriends() {
    try {
      const response = await apiClient.get<ApiResponse<Friend[]>>('/friends');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取友链失败');
    }
  },

  async createFriend(data: Omit<Friend, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const response = await apiClient.post<ApiResponse<Friend>>('/friends', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建友链失败');
    }
  },

  async updateFriend(id: number, data: Partial<Friend>) {
    try {
      const response = await apiClient.put<ApiResponse<Friend>>(`/friends/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新友链失败');
    }
  },

  async deleteFriend(id: number) {
    try {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/friends/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除友链失败');
    }
  }
}; 