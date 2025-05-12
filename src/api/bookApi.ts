import apiClient from './index';

export interface Book {
  id: number;
  type: 'book' | 'movie' | 'music';
  title: string;
  author?: string;
  cover?: string;
  date?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const bookApi = {
  async getBooks() {
    try {
      const response = await apiClient.get<ApiResponse<Book[]>>('/books');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取图书失败');
    }
  },

  async createBook(data: Omit<Book, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const response = await apiClient.post<ApiResponse<Book>>('/books', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建图书失败');
    }
  },

  async updateBook(id: number, data: Partial<Book>) {
    try {
      const response = await apiClient.put<ApiResponse<Book>>(`/books/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新图书失败');
    }
  },

  async deleteBook(id: number) {
    try {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/books/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除图书失败');
    }
  }
}; 