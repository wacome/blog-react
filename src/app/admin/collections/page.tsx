'use client';
import { useEffect, useState, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getCollections, createCollection, updateCollection, deleteCollection, Collection } from '@/api/collectionApi';

export default function CollectionsManagement() {
  const [items, setItems] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [newItem, setNewItem] = useState<{ type: 'book' | 'movie' | 'music'; title: string; author: string; cover: string; date: string; link: string; }>({ type: 'book', title: '', author: '', cover: '', date: '', link: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCollections().then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newItem.title.trim()) {
      alert('标题不能为空');
      return;
    }
    try {
      const created = await createCollection(newItem);
      setItems([...items, created]);
      setNewItem({ type: 'book', title: '', author: '', cover: '', date: '', link: '' });
      setShowAddForm(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const updated = await updateCollection(editing.id, editing);
      setItems(items.map(i => (i.id === updated.id ? updated : i)));
      setEditing(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该条目吗？')) return;
    try {
      await deleteCollection(id);
      setItems(items.filter(i => i.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/collection-cover', { method: 'POST', body: formData });
    const data = await res.json();
    setNewItem(item => ({ ...item, cover: data.url }));
  };

  const handleBatchDelete = async () => {
    if (!window.confirm('确定要批量删除选中条目吗？')) return;
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">书架管理</h1>
        <button className="btn btn-primary flex items-center" onClick={() => setShowAddForm(true)}>
          <FaPlus className="mr-2" /> 新建条目
        </button>
      </div>
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">新建条目</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="input" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value as 'book' | 'movie' | 'music' })}>
              <option value="book">书籍</option>
              <option value="movie">电影</option>
              <option value="music">音乐</option>
            </select>
            <input className="input" placeholder="标题" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
            <input className="input" placeholder="作者" value={newItem.author} onChange={e => setNewItem({ ...newItem, author: e.target.value })} />
            <input className="input" placeholder="封面URL" value={newItem.cover} onChange={e => setNewItem({ ...newItem, cover: e.target.value })} />
            <input className="input" placeholder="日期" value={newItem.date} onChange={e => setNewItem({ ...newItem, date: e.target.value })} />
            <input className="input" placeholder="详情链接" value={newItem.link} onChange={e => setNewItem({ ...newItem, link: e.target.value })} />
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>取消</button>
            <button className="btn btn-primary" onClick={handleAdd}>保存</button>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleUpload} />
          <button className="btn btn-secondary" type="button" onClick={() => fileInputRef.current?.click()}>上传封面</button>
          {newItem.cover && <img src={newItem.cover} alt="封面" className="w-16 h-20 object-cover rounded mt-2" />}
        </div>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">封面</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">详情</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <th><input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={e => setSelectedIds(e.target.checked ? items.map(i => i.id) : [])} /></th>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editing && editing.id === item.id ? (
                    <select className="input py-1 px-2 text-sm" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as any })}>
                      <option value="book">书籍</option>
                      <option value="movie">电影</option>
                      <option value="music">音乐</option>
                    </select>
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{item.type}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editing && editing.id === item.id ? (
                    <input className="input py-1 px-2 text-sm" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editing && editing.id === item.id ? (
                    <input className="input py-1 px-2 text-sm" value={editing.author || ''} onChange={e => setEditing({ ...editing, author: e.target.value })} />
                  ) : (
                    <div className="text-sm text-gray-500">{item.author}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editing && editing.id === item.id ? (
                    <input className="input py-1 px-2 text-sm" value={editing.cover || ''} onChange={e => setEditing({ ...editing, cover: e.target.value })} />
                  ) : (
                    item.cover && <img src={item.cover} alt={item.title} className="w-10 h-14 object-cover rounded" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editing && editing.id === item.id ? (
                    <input className="input py-1 px-2 text-sm" value={editing.date || ''} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                  ) : (
                    <div className="text-sm text-gray-500">{item.date}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editing && editing.id === item.id ? (
                    <input className="input py-1 px-2 text-sm" value={editing.link || ''} onChange={e => setEditing({ ...editing, link: e.target.value })} />
                  ) : (
                    item.link && <a href={item.link} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">详情</a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    {editing && editing.id === item.id ? (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={handleUpdate}>保存</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>取消</button>
                      </>
                    ) : (
                      <>
                        <button className="text-blue-500 hover:text-blue-700" onClick={() => setEditing(item)}><FaEdit /></button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                      </>
                    )}
                  </div>
                </td>
                <td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, item.id] : selectedIds.filter(id => id !== item.id))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-danger btn-sm ml-2" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>批量删除</button>
      </div>
    </div>
  );
} 