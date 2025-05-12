import apiClient from './index';

export interface Image {
  id: number;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: number;
  created_at: string;
  width: number;
  height: number;
}

export interface GetImagesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface GetImagesResponse {
  images: Image[];
  total: number;
  page: number;
  page_size: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export const imageApi = {
  // 获取图片列表
  getImages: async (params: GetImagesParams = {}) => {
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc', search = '' } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      sort_by: sortBy,
      sort_order: sortOrder,
      search,
    });
    try {
      const data = await apiClient.get<GetImagesResponse>(`/images?${queryParams}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '获取图片列表失败' };
    }
  },

  // 获取单个图片详情
  getImage: async (id: number) => {
    return await apiClient.get(`/images/${id}`);
  },

  // 上传图片
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await apiClient.post<Image>('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : '上传图片失败' };
    }
  },

  // 删除图片
  deleteImage: async (id: number) => {
    return await apiClient.delete(`/images/${id}`);
  },

  // 批量删除图片
  batchDeleteImages: async (ids: number[]) => {
    return await apiClient.post('/images/batch-delete', { ids });
  },
}; 