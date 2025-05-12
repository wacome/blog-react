import apiClient from './index';

export interface Book {
  id: number;
  title: string;
  author: string;
  desc: string;
  cover?: string;
  publisher?: string;
  publish_date?: string;
  isbn?: string;
  pages?: number;
  status?: 'want' | 'reading' | 'finished';
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  desc?: string;
  cover?: string;
  publisher?: string;
  publish_date?: string;
  isbn?: string;
  pages?: number;
  status?: 'want' | 'reading' | 'finished';
  rating?: number;
}

export interface UpdateBookInput extends CreateBookInput {
  id: number;
}

export interface GetBooksParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
}

export interface GetBooksResponse {
  books: Book[];
  total: number;
  page: number;
  page_size: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export const bookApi = {
  // 获取图书列表
  getBooks: async (params: GetBooksParams = {}) => {
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc', search = '', status = '' } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      sort_by: sortBy,
      sort_order: sortOrder,
      search,
      status,
    });
    try {
      const data = await apiClient.get<GetBooksResponse>(`/books?${queryParams}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '获取图书列表失败' };
    }
  },

  // 获取单个图书详情
  getBook: async (id: number) => {
    return await apiClient.get(`/books/${id}`);
  },

  // 创建图书
  createBook: async (book: CreateBookInput) => {
    try {
      const response = await apiClient.post<ApiResponse<Book>>('/books', book);
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '创建图书失败' };
    }
  },

  // 更新图书
  updateBook: async (book: UpdateBookInput) => {
    try {
      const response = await apiClient.put<ApiResponse<Book>>(`/books/${book.id}`, book);
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '更新图书失败' };
    }
  },

  // 删除图书
  deleteBook: async (id: number) => {
    try {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/books/${id}`);
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '删除图书失败' };
    }
  },

  // 批量删除图书
  batchDeleteBooks: async (ids: number[]) => {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/books/batch-delete', { ids });
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '批量删除图书失败' };
    }
  },

  // 上传图书封面
  uploadCover: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post<ApiResponse<{ url: string }>>('/books/upload-cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.code === 0) {
        return { data: response.data, error: null };
      }
      return { data: null, error: response.message };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '上传封面失败' };
    }
  },
}; 