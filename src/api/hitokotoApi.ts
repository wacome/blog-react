import apiClient from './index';

export interface Hitokoto {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

export async function getHitokotos(): Promise<Hitokoto[]> {
  const res: any = await apiClient.get('/hitokoto');
  // 兼容后端返回对象或数组
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function createHitokoto(data: Omit<Hitokoto, 'id' | 'createdAt'>): Promise<Hitokoto> {
  return await apiClient.post('/hitokoto', data);
}

export async function updateHitokoto(id: number, data: Partial<Hitokoto>): Promise<Hitokoto> {
  return await apiClient.put(`/hitokoto/${id}`, data);
}

export async function deleteHitokoto(id: number): Promise<{ message: string }> {
  return await apiClient.delete(`/hitokoto/${id}`);
} 