'use client';
import { useEffect, useState } from 'react';
import { getHitokotos, createHitokoto, updateHitokoto, deleteHitokoto } from '@/api/hitokotoApi';

// 类型定义适配后端
export interface Hitokoto {
  id: number;
  content: string;
  source: string;
  created_at: string;
  updated_at?: string;
}

export default function HitokotoManagement() {
  const [list, setList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ content: '', author: '', date: '' });
  const [editingItem, setEditingItem] = useState<Hitokoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getHitokotos()
      .then(data => setList(
        data.map((item: any) => ({
          ...item,
          source: item.source || item.author || '',
          created_at: item.created_at || item.createdAt || '',
        })) as Hitokoto[]
      ))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 新增
  const handleAdd = async () => {
    if (!newItem.content.trim()) {
      alert('内容不能为空');
      return;
    }
    try {
      const created = await createHitokoto(newItem);
      setList([...list, created]);
      setNewItem({ content: '', author: '', date: '' });
      setShowAddForm(false);
    } catch (e: any) {
      alert(e.message);
    }
  };
  // 编辑
  const startEditing = (item: Hitokoto) => setEditingItem(item);
  const cancelEditing = () => setEditingItem(null);
  const saveEditing = async () => {
    if (!editingItem) return;
    try {
      const updated = await updateHitokoto(editingItem.id, editingItem);
      setList(list.map(i => i.id === updated.id ? updated : i));
      setEditingItem(null);
    } catch (e: any) {
      alert(e.message);
    }
  };
  // 删除
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该一言吗？')) return;
    try {
      const response = await deleteHitokoto(id);
      if (response.message === '删除一言成功') {
        setList(list.filter(i => i.id !== id));
      } else {
        alert('删除失败，请重试');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };
  // 批量删除
  const handleBatchDelete = async () => {
    if (!window.confirm('确定要批量删除选中一言吗？')) return;
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">一言管理</h1>
        <button className="btn btn-primary flex items-center" onClick={() => setShowAddForm(true)}>新建一言</button>
      </div>
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-5 mb-6 w-full">
          <h2 className="text-lg font-semibold mb-4">新建一言</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <input type="text" className="input w-full" value={newItem.content} onChange={e => setNewItem({ ...newItem, content: e.target.value })} placeholder="输入一言内容" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
              <input type="text" className="input w-full" value={newItem.author} onChange={e => setNewItem({ ...newItem, author: e.target.value })} placeholder="输入作者（可选）" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input type="date" className="input w-full" value={newItem.date} onChange={e => setNewItem({ ...newItem, date: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>取消</button>
            <button className="btn btn-primary" onClick={handleAdd}>保存</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden w-full flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3"><input type="checkbox" checked={selectedIds.length === list.length && list.length > 0} onChange={e => setSelectedIds(e.target.checked ? list.map(i => i.id) : [])} /></th>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">内容</th>
              <th className="px-6 py-3">作者</th>
              <th className="px-6 py-3">日期</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, item.id] : selectedIds.filter(id => id !== item.id))} /></td>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4">
                  {editingItem && editingItem.id === item.id ? (
                    <input type="text" className="input py-1 px-2 text-sm w-full" value={editingItem.content} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} />
                  ) : (
                    <span>{item.content}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingItem && editingItem.id === item.id ? (
                    <input type="text" className="input py-1 px-2 text-sm w-full" value={editingItem.source} onChange={e => setEditingItem({ ...editingItem, source: e.target.value })} />
                  ) : (
                    <span>{item.source}</span>
                  )}
                </td>
                <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString('zh-CN')}</td>
                <td className="px-6 py-4 text-right">
                  {editingItem && editingItem.id === item.id ? (
                    <div className="flex justify-end space-x-3">
                      <button onClick={cancelEditing} className="text-gray-500 hover:text-gray-700">取消</button>
                      <button onClick={saveEditing} className="text-blue-500 hover:text-blue-700">保存</button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-3">
                      <button onClick={() => startEditing(item)} className="text-blue-500 hover:text-blue-700">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">删除</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="text-center py-10 text-gray-500">暂无一言</div>}
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <button className="btn btn-danger btn-sm ml-2" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>批量删除</button>
      </div>
    </div>
  );
} 