import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/login?error=no_code');
  }

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${apiBaseUrl}/api/auth/github/callback`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub OAuth 回调失败');
    }

    const data = await response.json();
    
    // 将用户信息存储在 localStorage 中
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
    }

    return NextResponse.redirect('/');
  } catch (error) {
    console.error('GitHub OAuth 错误:', error);
    return NextResponse.redirect('/login?error=oauth_failed');
  }
} 