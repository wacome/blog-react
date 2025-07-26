'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { commentApi } from '@/api/commentApi';
import { useUser } from '@/contexts/UserContext';
import { Comment as CommentType } from '@/types';
import type { CommentInput } from '@/api/commentApi';
import apiClient from '@/api';

// 扩展基础评论类型，以支持嵌套
interface Comment extends CommentType {
  children?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  postId: number;
}

// 辅助函数：将扁平的评论列表转换为树形结构
function buildCommentTree(comments: Comment[]): Comment[] {
  const map: Record<number, Comment> = {};
  comments.forEach(c => (map[c.id] = { ...c, children: [] }));
  const tree: Comment[] = [];
  comments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children?.push(map[c.id]);
    } else {
      tree.push(map[c.id]);
    }
  });
  return tree;
}

// 主组件
export default function CommentSection({ comments, postId }: CommentSectionProps) {
  const { user, setUser } = useUser();
  const [localComments, setLocalComments] = useState<Comment[]>(Array.isArray(comments) ? comments : []);
  
  // 表单状态
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [commentText, setCommentText] = useState('');
  
  // UI状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  
  // 回复功能状态
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // 安全性：用于防止机器人提交的蜜罐字段
  const [honeypot, setHoneypot] = useState('');
  const formRenderTime = useRef(Date.now());

  // 当用户信息变化时，自动填充表单
  useEffect(() => {
    if (user) {
      setName(user.nickname || user.username || '');
      setEmail(user.email || '');
    } else {
      // 如果用户登出，不清空，以便匿名用户可以继续评论
    }
  }, [user]);

  // GitHub 登录处理
  const handleGitHubLogin = () => {
    setIsGitHubLoading(true);
    // 登录后返回当前页面
    const returnUrl = window.location.href;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${apiBaseUrl}/auth/github?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  // 退出登录处理
  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('user');
      window.location.reload(); // 强制刷新页面以清除所有状态
    } catch (e) {
      setError('退出登录失败，请重试');
    }
  };

  // 提交评论的通用逻辑
  const submitComment = async (content: string, parentId?: number) => {
    setError(null);
    setSuccess(null);

    // 安全性检查 1: 检查蜜罐字段
    if (honeypot) return;
    // 安全性检查 2: 检查提交速度
    if (Date.now() - formRenderTime.current < 3000) {
      setError('您的操作太快了，请休息一下再试。');
      return;
    }

    if (!content.trim() || !name.trim() || !email.trim()) {
      setError('昵称、邮箱和评论内容不能为空');
      return;
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    parentId ? setReplyLoading(true) : setLoading(true);

    try {
      const newCommentData: CommentInput = {
        author: name,
        content,
        email,
        website,
        avatar: user?.avatar,
        parent_id: parentId,
      };

      const newCommentFromApi = await commentApi.createComment(postId, newCommentData);
      
      // **修复类型错误的关键**：手动为新评论添加本地状态所需的字段
      const newCommentForState: Comment = {
        ...newCommentFromApi,
        post_id: postId, // 确保 post_id 存在
        status: (newCommentFromApi as any).status || 'approved', // 确保 status 存在
        children: [],
      };
      
      setLocalComments(prev => [newCommentForState, ...prev]);

      // 成功后清空输入框
      if (parentId) {
        setReplyText('');
        setReplyTo(null);
      } else {
        setCommentText('');
      }

      setSuccess('评论已提交，正在等待审核。');
      // 成功后重置表单渲染时间
      formRenderTime.current = Date.now();
    } catch (e: any) {
      setError(e.message || '评论提交失败');
    } finally {
      parentId ? setReplyLoading(false) : setLoading(false);
    }
  };

  // 兼容旧的 `created_at` 字段
  const commentTree = buildCommentTree(
    localComments.map(c => ({ ...c, createdAt: c.createdAt || c.created_at }))
  );

  // 递归渲染评论项
  const renderCommentItem = (comment: Comment, depth = 0) => {
    const isReplying = replyTo === comment.id;
    return (
      <div key={comment.id} className={`transition-all duration-300 ${depth > 0 ? 'ml-6 md:ml-10' : ''}`}>
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
                <button 
                  className="text-xs text-primary hover:underline" 
                  onClick={() => setReplyTo(isReplying ? null : comment.id)}
                >
                  {isReplying ? '取消回复' : '回复'}
                </button>
              </div>
              
              {isReplying && (
                <div className="mt-3">
                  <form onSubmit={(e) => { e.preventDefault(); submitComment(replyText, comment.id); }}>
                    {/* 安全性：蜜罐字段 */}
                    <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} style={{ display: 'none' }} />
                    <textarea
                      className="textarea min-h-[60px] text-sm w-full"
                      placeholder={`回复 @${comment.author}`}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      required
                    />
                    <div className="flex justify-end mt-2 gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => setReplyTo(null)} type="button">取消</button>
                      <button className="btn btn-primary btn-sm" type="submit" disabled={replyLoading}>
                        {replyLoading ? '提交中...' : '回复'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {comment.children && comment.children.length > 0 && (
                <div className="mt-2 border-l-2 border-gray-100 pl-4">
                  {comment.children.map(child => renderCommentItem(child, depth + 1))}
                </div>
              )}
            </div>
        </div>
      </div>
    );
  };
  
  return (
    <section className="mt-8 md:mt-12 px-4 md:px-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-primary pl-3">评论 ({localComments.length})</h2>
      
      <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
        {commentTree.map(comment => renderCommentItem(comment))}
      </div>
      
      {/* 只有在不回复任何楼中楼时，才显示主评论框 */}
      {replyTo === null && (
        <div className="card p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">发表评论</h3>
          
          {user ? (
            <div className="flex items-center mb-4 space-x-3">
              <Image
                src={user.avatar || '/images/default-avatar.png'}
                alt={user.nickname || user.username || '用户头像'}
                width={40}
                height={40}
                className="rounded-full object-cover border"
              />
              <span className="text-gray-700 text-base">已登录为 <span className="font-semibold">{user.nickname || user.username}</span></span>
              <button
                type="button"
                className="ml-auto px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          ) : (
             <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  className="btn btn-secondary w-full md:w-auto flex items-center justify-center gap-2 text-sm"
                  disabled={isGitHubLoading}
                >
                  {isGitHubLoading ? '正在跳转...' : <><FaGithub className="text-lg" /> 使用 GitHub 快速评论</>}
                </button>
              </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); submitComment(commentText); }}>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
            {/* 安全性：蜜罐字段 */}
            <input type="text" name="confirm_email" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                <input type="text" className="input text-sm" placeholder="昵称 (必填)" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" className="input text-sm" placeholder="邮箱 (必填，不会公开)" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="url" className="input text-sm" placeholder="网址 (可选)" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            )}
            
            <textarea
              className="textarea min-h-[100px] md:min-h-[120px] text-sm"
              placeholder="说些什么..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            
            <div className="text-right mt-4">
              <button type="submit" className="btn btn-primary w-full md:w-auto text-sm" disabled={loading}>
                {loading ? '提交中...' : '发表评论'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}