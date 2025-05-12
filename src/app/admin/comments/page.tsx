'use client';
import { useEffect, useState } from 'react';
import { FaTrash, FaCheck } from 'react-icons/fa';
import { commentApi, Comment } from '@/api/commentApi';

export default function CommentsManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    commentApi.getAllComments()
      .then(data => {
        // 字段转换，兼容 created_at
        const mapped = (Array.isArray(data) ? data : []).map(item => ({
          ...item,
          createdAt: item.created_at,
        }));
        setComments(mapped);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 批量删除
  const handleBatchDelete = async () => {
    if (!window.confirm('确定要批量删除选中评论吗？')) return;
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  // 单条删除
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该评论吗？')) return;
    try {
      await commentApi.deleteComment(id);
      setComments(comments.filter(c => c.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 审核评论
  const handleApprove = async (id: number) => {
    if (!window.confirm('确定要审核通过该评论吗？')) return;
    try {
      const updated = await commentApi.approveComment(id);
      setComments(comments.map(c => c.id === id ? { ...c, approved: true } : c));
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="p-2 md:p-8 w-full">
      <div className="flex flex-col flex-1 w-full min-h-full animate-fade-in bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">评论管理</h1>
          <button className="btn btn-danger btn-sm" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>批量删除</button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-center"><input type="checkbox" checked={selectedIds.length === comments.length && comments.length > 0} onChange={e => setSelectedIds(e.target.checked ? comments.map(c => c.id) : [])} /></th>
                <th className="text-center">ID</th>
                <th className="text-center">作者</th>
                <th className="text-center">内容</th>
                <th className="text-center">日期</th>
                <th className="text-center">状态</th>
                <th className="text-center">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(comments) && comments.map(comment => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="text-center"><input type="checkbox" checked={selectedIds.includes(comment.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, comment.id] : selectedIds.filter(id => id !== comment.id))} /></td>
                  <td className="text-center">{comment.id}</td>
                  <td className="text-center">{comment.author}</td>
                  <td className="text-center">{comment.content}</td>
                  <td className="text-center">
                    {comment.createdAt && !isNaN(Date.parse(comment.createdAt))
                      ? new Date(comment.createdAt).toLocaleString('zh-CN')
                      : '-'}
                  </td>
                  <td className="text-center">{comment.approved ? <span className="text-green-600">已审核</span> : <span className="text-yellow-600">待审核</span>}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!comment.approved && (
                        <button className="btn btn-success btn-xs" onClick={() => handleApprove(comment.id)}><FaCheck /> 审核</button>
                      )}
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(comment.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {comments.length === 0 && <div className="text-center py-10 text-gray-500">暂无评论</div>}
        </div>
      </div>
    </div>
  );
} 