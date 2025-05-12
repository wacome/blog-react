'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { commentApi } from '@/api/commentApi';
import { useUser } from '@/contexts/UserContext';
import { Comment as CommentType } from '@/types';
import type { CommentInput } from '@/api/commentApi';
import type { User as ApiUser } from '@/api/userApi';

interface Comment extends CommentType {
  children?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  postId: number;
}

// 将扁平评论数组转为树结构
function buildCommentTree(comments: Comment[]): Comment[] {
  const map: Record<number, Comment & { children?: Comment[] }> = {};
  comments.forEach(c => (map[c.id] = { ...c, children: [], post_id: c.post_id, status: c.status }));
  const tree: Comment[] = [];
  comments.forEach(c => {
    if (c.parent_id) {
      map[c.parent_id]?.children?.push(map[c.id]);
    } else {
      tree.push(map[c.id]);
    }
  });
  return tree;
}

export default function CommentSection({ comments, postId }: CommentSectionProps) {
  const { user, setUser } = useUser();
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(Array.isArray(comments) ? comments : []);
  const [name, setName] = useState(user?.nickname || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null); // 当前正在回复哪条评论
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.nickname || user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleGitHubLogin = () => {
    try {
      setIsGitHubLoading(true);
      setError(null);
      // 记录原始页面
      localStorage.setItem('returnUrl', window.location.href);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      // 固定回调到 /auth/callback
      window.location.href = `${apiBaseUrl}/auth/github?returnUrl=${encodeURIComponent('https://blog.toycon.cn/auth/callback')}`;
    } catch (err) {
      setError('GitHub登录失败，请稍后重试');
      setIsGitHubLoading(false);
    }
  };

  // 顶级评论提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!commentText.trim() || !name.trim() || !email.trim()) {
      setError('昵称、邮箱和评论内容不能为空');
      return;
    }
    // 邮箱格式校验
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    try {
      const newComment = await commentApi.createComment(postId, {
        author: name,
        content: commentText,
        email,
        website,
        avatar: user?.avatar,
        // 顶级评论不传parent_id
      } as CommentInput);
      setLocalComments([{ 
        ...newComment, 
        post_id: postId, 
        created_at: newComment.created_at || '',
        updated_at: newComment.updated_at || '',
        status: (newComment as any).status || 'approved',
      }, ...localComments]);
      setCommentText('');
      if (!user) {
      setName('');
      setEmail('');
      setWebsite('');
      }
      setSuccess('评论已提交，正在等待审核，审核通过后将显示在评论区');
    } catch (e: any) {
      setError(e.message || '评论提交失败');
    } finally {
      setLoading(false);
    }
  };

  // 兼容 createdAt/created_at 字段，避免 Invalid Date
  const displayComments = localComments.map(comment => ({
    ...comment,
    createdAt: comment.createdAt || comment.created_at,
    parent_id: comment.parent_id,
  }));
  const commentTree = buildCommentTree(displayComments);

  // 回复评论提交
  const handleReplySubmit = async (parentId: number) => {
    if (!replyText.trim() || !name.trim() || !email.trim()) {
      setError('昵称、邮箱和评论内容不能为空');
      return;
    }
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setReplyLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const newComment = await commentApi.createComment(postId, {
        author: name,
        content: replyText,
        email,
        website,
        avatar: user?.avatar,
        parent_id: parentId,
      } as CommentInput);
      setLocalComments([{ 
        ...newComment, 
        post_id: postId, 
        created_at: newComment.created_at || '',
        updated_at: newComment.updated_at || '',
        status: (newComment as any).status || 'approved',
      }, ...localComments]);
      setReplyText('');
      setReplyTo(null);
      setSuccess('回复已提交，正在等待审核，审核通过后将显示在评论区');
    } catch (e: any) {
      setError(e.message || '回复提交失败');
    } finally {
      setReplyLoading(false);
    }
  };

  // 递归渲染评论
  function renderCommentItem(comment: Comment, depth = 0) {
  return (
      <div key={comment.id} className={`mb-3 ${depth > 0 ? 'ml-6 md:ml-10' : ''}`}>
        <div className="card p-4 md:p-5 flex flex-col md:flex-row">
            <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4 flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image 
                  src={comment.avatar || '/images/default-avatar.png'} 
                  alt={comment.author} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="ml-3 md:hidden">
                <h3 className="font-medium text-gray-800">{comment.author}</h3>
              <span className="text-xs text-gray-500">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('zh-CN') : ''}</span>
              </div>
            </div>
            <div className="flex-grow">
              <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className="font-medium text-gray-800">{comment.author}</h3>
              <span className="text-xs text-gray-500">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('zh-CN') : ''}</span>
            </div>
            <p className="text-gray-700 text-sm md:text-base whitespace-pre-line">{comment.content}</p>
            <div className="mt-2 flex gap-3">
              <button className="text-xs text-primary hover:underline" onClick={() => setReplyTo(comment.id)}>回复</button>
            </div>
            {/* 回复表单 */}
            {replyTo === comment.id && (
              <div className="mt-3">
                <textarea
                  className="textarea min-h-[60px] text-sm w-full"
                  placeholder={`回复 @${comment.author}`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setReplyTo(null); setReplyText(''); }} type="button">取消</button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleReplySubmit(comment.id)} disabled={replyLoading}>{replyLoading ? '提交中...' : '回复'}</button>
                </div>
              </div>
            )}
            {/* 子评论递归 */}
            {comment.children && comment.children.length > 0 && (
              <div className="mt-2">
                {comment.children.map((child: Comment) => renderCommentItem(child, depth + 1))}
              </div>
            )}
          </div>
        </div>
            </div>
    );
  }

  return (
    <section className="mt-8 md:mt-12 px-4 md:px-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-primary pl-3">评论 ({localComments.length})</h2>
      
      {/* 评论列表 */}
      <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
        {commentTree.map(comment => renderCommentItem(comment))}
      </div>
      
      {/* 评论表单 */}
      <div className="card p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">发表评论</h3>
        {/* 已登录用户信息展示 */}
        {user && (
          <div className="flex items-center mb-4 space-x-3">
            <img
              src={user.avatar && user.avatar.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(user.avatar)}` : user.avatar}
              alt={user.nickname || user.username || '用户头像'}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <span className="text-gray-700 text-base">已登录为 <span className="font-semibold">{user.nickname || user.username}</span></span>
            <button
              type="button"
              className="ml-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
              }}
            >
              退出登录
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {error && <div className="text-red-500 mb-2 text-sm md:text-base">{error}</div>}
          {success && <div className="text-green-600 mb-2 text-sm md:text-base">{success}</div>}
          {/* 未登录时显示输入框和GitHub登录按钮 */}
          {!user && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    className="input text-sm md:text-base"
                    placeholder="昵称 (必填)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    className="input text-sm md:text-base"
                    placeholder="邮箱 (必填)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="url"
                    className="input text-sm md:text-base"
                    placeholder="网址 (可选)"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
              {/* GitHub 登录按钮 */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  className="btn btn-secondary w-full md:w-auto flex items-center justify-center gap-2 text-sm md:text-base"
                  disabled={isGitHubLoading}
                >
                  {isGitHubLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      正在跳转...
                    </>
                  ) : (
                    <>
                      <FaGithub className="text-lg" />
                      使用 GitHub 登录
                    </>
                  )}
                </button>
              </div>
            </>
          )}
          {/* 评论内容输入框和提交按钮始终显示 */}
          <div className="mb-4">
            <textarea
              className="textarea min-h-[100px] md:min-h-[120px] text-sm md:text-base"
              placeholder="说些什么..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
          </div>
          <div className="text-right">
            <button 
              type="submit" 
              className="btn btn-primary w-full md:w-auto text-sm md:text-base" 
              disabled={loading}
            >
              {loading ? '提交中...' : '发表'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
} 