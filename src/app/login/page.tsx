'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/api/userApi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ email, password });
      localStorage.setItem('admin_token', res.token);
      router.push('/admin');
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">登录后台</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">邮箱</label>
          <input
            type="email"
            className="input w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="请输入邮箱"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">密码</label>
          <input
            type="password"
            className="input w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
          />
        </div>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
} 