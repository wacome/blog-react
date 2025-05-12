'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { tagApi, Tag } from '@/api/tagApi';

export default function TagsManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState<{ name: string; slug: string }>({ name: '', slug: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    tagApi.getTags()
      .then(data => setTags(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newTag.name.trim()) {
      alert('标签名不能为空');
      return;
    }
    try {
      const created = await tagApi.createTag(newTag);
      setTags([...tags, created]);
      setNewTag({ name: '', slug: '' });
      setShowAddForm(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingTag) return;
    try {
      const updated = await tagApi.updateTag(editingTag.id, editingTag);
      setTags(tags.map(t => (t.id === updated.id ? updated : t)));
      setEditingTag(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该标签吗？')) return;
    try {
      await tagApi.deleteTag(id);
      setTags(tags.filter(t => t.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm('确定要批量删除选中标签吗？')) return;
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="p-2 md:p-8 w-full">
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">标签管理</h1>
          <button className="btn btn-primary flex items-center" onClick={() => setShowAddForm(true)}>
            <FaPlus className="mr-2" /> 新建标签
          </button>
        </div>
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4">新建标签</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input" placeholder="标签名" value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })} />
              <input className="input" placeholder="别名" value={newTag.slug} onChange={e => setNewTag({ ...newTag, slug: e.target.value })} />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAdd}>保存</button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">选择</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">别名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文章数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <motion.tr 
                  key={tag.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input type="checkbox" checked={selectedIds.includes(tag.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, tag.id] : selectedIds.filter(id => id !== tag.id))} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tag.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingTag && editingTag.id === tag.id ? (
                      <input 
                        type="text" 
                        className="input py-1 px-2 text-sm"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingTag && editingTag.id === tag.id ? (
                      <input 
                        type="text" 
                        className="input py-1 px-2 text-sm"
                        value={editingTag.slug}
                        onChange={(e) => setEditingTag({...editingTag, slug: e.target.value})}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{tag.slug}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tag.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      {editingTag && editingTag.id === tag.id ? (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={handleUpdate}>保存</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingTag(null)}>取消</button>
                        </>
                      ) : (
                        <>
                          <button className="text-blue-500 hover:text-blue-700" onClick={() => setEditingTag(tag)}><FaEdit /></button>
                          <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(tag.id)}><FaTrash /></button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-danger btn-sm ml-2" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>批量删除</button>
        </div>
      </div>
    </div>
  );
} 