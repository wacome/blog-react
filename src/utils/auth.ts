// 从localStorage获取token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// 保存token到localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 从localStorage删除token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 