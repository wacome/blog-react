'use client';

import { useRef, useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { friendApi, Friend } from '@/api/friendApi';

export default function FriendsManagement() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFriend, setNewFriend] = useState({
    name: '',
    url: '',
    desc: '',
    avatar: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载友链列表
  useEffect(() => {
    friendApi.getFriends()
      .then(data => setFriends(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 上传图片
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    setUploadStatus('');
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/friend-avatar');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setUploadStatus('上传成功');
        setTimeout(() => setUploadStatus(''), 1500);
        if (editingFriend) {
          setEditingFriend({ ...editingFriend, avatar: data.url });
        } else {
          setNewFriend({ ...newFriend, avatar: data.url });
        }
      } else {
        setUploadStatus('上传失败');
      }
    };
    xhr.onerror = () => setUploadStatus('上传失败');
    xhr.send(formData);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个友链吗？')) return;
    try {
      await friendApi.deleteFriend(id);
      setFriends(friends.filter(f => f.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriend.name.trim() || !newFriend.url.trim()) {
      alert('名称和链接不能为空');
      return;
    }
    try {
      const createdFriend = await friendApi.createFriend(newFriend);
      setFriends([...friends, createdFriend]);
      setNewFriend({ name: '', url: '', desc: '', avatar: '' });
      setShowAddForm(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startEditing = (friend: Friend) => {
    setEditingFriend(friend);
  };

  const cancelEditing = () => {
    setEditingFriend(null);
  };

  const saveEditing = async () => {
    if (!editingFriend) return;
    try {
      const updatedFriend = await friendApi.updateFriend(editingFriend.id, editingFriend);
      setFriends(friends.map(f => f.id === editingFriend.id ? updatedFriend : f));
      setEditingFriend(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (!window.confirm('确定要批量删除选中友链吗？')) return;
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  return (
    <div className="p-2 md:p-8 w-full">
      <div className="flex flex-col flex-1 min-h-screen bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">友链管理</h1>
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus className="mr-2" />
            新建友链
          </button>
        </div>

        {/* 添加友链表单 */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-5 mb-6 w-full">
            <h2 className="text-lg font-semibold mb-4">新建友链</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newFriend.name}
                  onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                  placeholder="输入友链名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">链接</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newFriend.url}
                  onChange={(e) => setNewFriend({ ...newFriend, url: e.target.value })}
                  placeholder="输入友链URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newFriend.desc}
                  onChange={(e) => setNewFriend({ ...newFriend, desc: e.target.value })}
                  placeholder="输入友链描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">头像</label>
                <div>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleUpload} />
                  <button className="btn btn-secondary" type="button" onClick={() => fileInputRef.current?.click()}>上传头像</button>
                  <input
                    type="text"
                    className="input mt-2 w-full"
                    value={newFriend.avatar}
                    onChange={(e) => setNewFriend({ ...newFriend, avatar: e.target.value })}
                    placeholder="或直接输入头像URL"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-32 mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-blue-400 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  {uploadStatus && <span className="ml-2 text-green-600 text-sm">{uploadStatus}</span>}
                  {newFriend.avatar && <img src={newFriend.avatar} alt="头像" className="w-10 h-10 object-cover rounded-full mt-2" />}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                取消
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddFriend}
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* 友链列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden w-full flex-1">
          {loading ? (
            <div className="text-center py-10 text-gray-500">加载中...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" checked={selectedIds.length === friends.length && friends.length > 0} onChange={e => setSelectedIds(e.target.checked ? friends.map(f => f.id) : [])} />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    头像
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    链接
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {friends.map((friend) => (
                  <motion.tr 
                    key={friend.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input type="checkbox" checked={selectedIds.includes(friend.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, friend.id] : selectedIds.filter(id => id !== friend.id))} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {friend.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFriend && editingFriend.id === friend.id ? (
                        <div className="flex flex-col gap-2">
                          <div>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleUpload} />
                            <button className="btn btn-secondary btn-xs" onClick={() => fileInputRef.current?.click()}>更换头像</button>
                          </div>
                          <input
                            type="text"
                            className="input w-full text-sm"
                            value={editingFriend.avatar}
                            onChange={(e) => setEditingFriend({...editingFriend, avatar: e.target.value})}
                            placeholder="或直接输入头像URL"
                          />
                          {editingFriend.avatar && <img src={editingFriend.avatar.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(editingFriend.avatar)}` : editingFriend.avatar} alt="头像" className="w-8 h-8 object-cover rounded-full mt-2" onError={e => { (e.target as HTMLImageElement).src = '/images/default-cover.jpg'; }} />}
                        </div>
                      ) : (
                        friend.avatar && <img src={friend.avatar.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(friend.avatar)}` : friend.avatar} alt="头像" className="w-8 h-8 object-cover rounded-full" onError={e => { (e.target as HTMLImageElement).src = '/images/default-cover.jpg'; }} />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFriend && editingFriend.id === friend.id ? (
                        <input 
                          type="text" 
                          className="input py-1 px-2 text-sm w-full"
                          value={editingFriend.name}
                          onChange={(e) => setEditingFriend({...editingFriend, name: e.target.value})}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{friend.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFriend && editingFriend.id === friend.id ? (
                        <input 
                          type="text" 
                          className="input py-1 px-2 text-sm w-full"
                          value={editingFriend.url}
                          onChange={(e) => setEditingFriend({...editingFriend, url: e.target.value})}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{friend.url}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFriend && editingFriend.id === friend.id ? (
                        <input 
                          type="text" 
                          className="input py-1 px-2 text-sm w-full"
                          value={editingFriend.desc}
                          onChange={(e) => setEditingFriend({...editingFriend, desc: e.target.value})}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{friend.desc}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingFriend && editingFriend.id === friend.id ? (
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={cancelEditing}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                          <button 
                            onClick={saveEditing}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            保存
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => startEditing(friend)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(friend.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
          
          {friends.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              暂无友链
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button className="btn btn-danger btn-sm ml-2" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>批量删除</button>
        </div>
      </div>
    </div>
  );
} 