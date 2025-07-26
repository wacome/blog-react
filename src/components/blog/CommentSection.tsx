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

// 定义评论类型，并包含子评论
interface Comment extends CommentType {
  children?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  postId: number;
}

// -------------------- 辅助函数 --------------------

// 将扁平的评论列表转换为树形结构以便于嵌套渲染
function buildCommentTree(comments: Comment[]): Comment[] {
  // 创建一个映射表，方便通过ID快速查找评论
  const map: Record<number, Comment & { children?: Comment[] }> = {};
  comments.forEach(c => {
    // 确保每个评论对象都有一个空的 children 数组
    map[c.id] = { ...c, children: [], post_id: c.post_id, status: c.status };
  });
  
  const tree: Comment[] = [];
  comments.forEach(c => {
    // 如果评论有 parent_id，就将其放入父评论的 children 数组中
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children?.push(map[c.id]);
    } else {
      // 否则，这是一个顶级评论
      tree.push(map[c.id]);
    }
  });
  return tree;
}

// -------------------- 主组件 --------------------

export default function CommentSection({ comments, postId }: CommentSectionProps) {
  const { user, setUser } = useUser();
  const [localComments, setLocalComments] = useState<Comment[]>(Array.isArray(comments) ? comments : []);
  
  // 状态管理
  const [replyTo, setReplyTo] = useState<number | null>(null); // 正在回复的评论ID
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 记录表单渲染时间，用于简单的反机器人检查
  const formRenderTime = useRef(Date.now());

  // 用户登录后，自动填充他们的信息
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.nickname || user.username || '');
      setEmail(user.email || '');
    } else {
      // 用户退出后清空信息
      setName('');
      setEmail('');
    }
  }, [user]);

  // 新增评论到本地状态的通用函数
  const addCommentToState = (newComment: CommentType) => {
    setLocalComments(prevComments => [
      { 
        ...newComment,
        post_id: postId,
        created_at: newComment.created_at || new Date().toISOString(),
        updated_at: newComment.updated_at || new Date().toISOString(),
        status: (newComment as any).status || 'approved',
        children: [] // 确保新评论有 children 属性
      }, 
      ...prevComments
    ]);
  };

  // 退出登录处理
  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('user');
      window.location.reload(); // 刷新页面以确保状态完全重置
    } catch (e) {
      setError('退出登录失败，请重试');
    }
  };
  
  // 兼容 createdAt/created_at 字段，并构建评论树
  const displayComments = localComments.map(comment => ({
    ...comment,
    createdAt: comment.createdAt || comment.created_at,
    parent_id: comment.parent_id,
  }));
  const commentTree = buildCommentTree(displayComments);

  // 递归渲染评论项
  function renderCommentItem(comment: Comment, depth = 0) {
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
              {/* 回复表单 */}
              {isReplying && (
                <div className="mt-3">
                  <CommentForm
                    parentId={comment.id}
                    onSubmit={addCommentToState}
                    onCancel={() => setReplyTo(null)}
                    placeholder={`回复 @${comment.author}`}
                    isReplyForm={true}
                  />
                </div>
              )}
              {/* 子评论递归 */}
              {comment.children && comment.children.length > 0 && (
                <div className="mt-2 border-l-2 border-gray-100 pl-4">
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
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-primary pl-3">
        评论 ({localComments.length})
      </h2>
      
      {/* 评论列表 */}
      <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
        {commentTree.map(comment => renderCommentItem(comment))}
      </div>
      
      {/* 只有在不回复任何楼中楼时，才显示主评论框 */}
      {replyTo === null && (
        <div className="card p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">发表评论</h3>
          
          {/* 已登录用户信息展示 */}
          {user ? (
            <div className="flex items-center mb-4 space-x-3">
              <img
                src={user.avatar || '/images/default-avatar.png'}
                alt={user.nickname || user.username || '用户头像'}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <span className="text-gray-700 text-base">
                已登录为 <span className="font-semibold">{user.nickname || user.username}</span>
              </span>
              <button
                type="button"
                className="ml-auto px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          ) : null}

          <CommentForm onSubmit={addCommentToState} />
        </div>
      )}
    </section>
  );

  // -------------------- 评论表单子组件 --------------------
  
  interface CommentFormProps {
    onSubmit: (newComment: CommentType) => void;
    onCancel?: () => void;
    parentId?: number;
    placeholder?: string;
    isReplyForm?: boolean;
  }

  function CommentForm({ onSubmit, onCancel, parentId, placeholder = "说些什么...", isReplyForm = false }: CommentFormProps) {
    const [text, setText] = useState('');
    const [website, setWebsite] = useState('');
    const [honeypot, setHoneypot] = useState(''); // 安全性：防机器人蜜罐字段
    const [isGitHubLoading, setIsGitHubLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      // 安全性：检查蜜罐字段
      if (honeypot) {
        console.warn("Bot detected!");
        return;
      }

      // 安全性：检查提交速度
      if (Date.now() - formRenderTime.current < 2000) { // 小于2秒的提交很可能是机器人
        setError('您的操作太快了，请稍后再试');
        return;
      }
      
      if (!text.trim() || !name.trim() || !email.trim()) {
        setError('昵称、邮箱和评论内容不能为空');
        return;
      }

      const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setError('请输入有效的邮箱地址');
        return;
      }

      setIsLoading(true);
      try {
        const commentData: CommentInput = {
          author: name,
          content: text,
          email,
          website: website || undefined,
          avatar: user?.avatar,
          parent_id: parentId,
        };

        const newComment = await commentApi.createComment(postId, commentData);
        onSubmit(newComment);
        setText('');
        if (!user) {
          // 如果是匿名用户，保留信息以便连续评论
          // setName('');
          // setEmail('');
          setWebsite('');
        }
        setSuccess('评论已提交，正在等待审核。');
        if(onCancel) onCancel(); // 成功后关闭回复框
      } catch (e: any) {
        setError(e.message || '评论提交失败');
      } finally {
        setIsLoading(false);
      }
    };

    const handleGitHubLogin = () => {
      setIsGitHubLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      window.location.href = `${apiBaseUrl}/auth/github?returnUrl=${encodeURIComponent(window.location.href)}`;
    };

    return (
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}

        {/* 安全性：蜜罐字段，对用户不可见 */}
        <input type="text" name="confirm_email" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        {!user && !isReplyForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
              <input type="text" className="input text-sm" placeholder="昵称 (必填)" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="email" className="input text-sm" placeholder="邮箱 (必填，不会公开)" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="url" className="input text-sm" placeholder="网址 (可选)" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div className="mb-4">
              <button type="button" onClick={handleGitHubLogin} className="btn btn-secondary w-full md:w-auto flex items-center justify-center gap-2 text-sm" disabled={isGitHubLoading}>
                {isGitHubLoading ? '正在跳转...' : <><FaGithub className="text-lg" /> 使用 GitHub 登录</>}
              </button>
            </div>
          </>
        )}
        
        <div className="mb-4">
          <textarea
            className={`textarea min-h-[100px] text-sm ${isReplyForm ? 'min-h-[60px]' : 'md:min-h-[120px]'}`}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end gap-2">
          {onCancel && <button className="btn btn-secondary btn-sm" onClick={onCancel} type="button">取消</button>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
            {isLoading ? '提交中...' : isReplyForm ? '回复' : '发表'}
          </button>
        </div>
      </form>
    );
  }
}