import apiClient from './index';

export interface Image {
  id: number;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: number;
  createdAt: string;
}

export async function getImages(): Promise<Image[]> {
  return await apiClient.get('/images');
}

export async function getImage(id: number): Promise<Image> {
  return await apiClient.get(`/images/${id}`);
}

export async function uploadImage(file: File): Promise<Image> {
  const formData = new FormData();
  formData.append('file', file);
  return await apiClient.post('/images', formData);
}

export async function deleteImage(id: number): Promise<void> {
  return await apiClient.delete(`/images/${id}`);
}

export async function batchDeleteImages(ids: number[]): Promise<void> {
  return await apiClient.post('/images/batch-delete', { ids });
} 