'use client';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { bookApi, type Book, type CreateBookInput } from '@/api/book';

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState<CreateBookInput>({
    title: '',
    author: '',
    desc: '',
    cover: '',
    status: 'want',
  });
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await bookApi.getBooks({
        page,
        pageSize,
        sortBy,
        sortOrder,
        search,
      });

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('获取图书列表失败');
      }

      setBooks(data.books);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取图书列表失败');
      toast.error(err instanceof Error ? err.message : '获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [page, pageSize, sortBy, sortOrder, search]);

  // 上传封面
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    try {
      setUploadProgress(0);
      const { data, error } = await bookApi.uploadCover(file);

      if (error || !data) {
        throw new Error(error || '上传失败');
      }

      const url = data.url;
      setNewBook(prev => ({ ...prev, cover: url }));
      if (editingBook) {
        setEditingBook({ ...editingBook, cover: url });
      }
    } catch (err: any) {
      toast.error(err?.message || '图片上传失败');
    } finally {
      setUploadProgress(0);
    }
  };

  // 新增
  const handleAddBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      toast.error('书名和作者不能为空');
      return;
    }

    try {
      const { error } = await bookApi.createBook(newBook);

      if (error) {
        throw new Error(error);
      }

      toast.success('图书创建成功');
      setNewBook({ title: '', author: '', desc: '', cover: '', status: 'want' });
      setShowAddForm(false);
      loadBooks();
    } catch (err: any) {
      toast.error(err?.message || '创建图书失败');
    }
  };

  // 编辑
  const startEditing = (book: Book) => setEditingBook(book);
  const cancelEditing = () => setEditingBook(null);
  const saveEditing = async () => {
    if (!editingBook) return;

    try {
      const { error } = await bookApi.updateBook(editingBook);

      if (error) {
        throw new Error(error);
      }

      toast.success('图书更新成功');
      setEditingBook(null);
      loadBooks();
    } catch (err: any) {
      toast.error(err?.message || '更新图书失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这本书吗？')) return;

    try {
      const { error } = await bookApi.deleteBook(id);

      if (error) {
        throw new Error(error);
      }

      toast.success('图书已删除');
      loadBooks();
    } catch (err: any) {
      toast.error(err?.message || '删除图书失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('请选择要删除的图书');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 本图书吗？`)) return;

    try {
      const { error } = await bookApi.batchDeleteBooks(selectedIds);

      if (error) {
        throw new Error(error);
      }

      toast.success('批量删除成功');
      setSelectedIds([]);
      loadBooks();
    } catch (err: any) {
      toast.error(err?.message || '批量删除图书失败');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBooks();
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="p-2 md:p-8 w-full">
      <div className="flex flex-col flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">图书管理</h1>
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索图书..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                搜索
              </button>
            </form>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={() => setShowAddForm(true)}
            >
              新建图书
            </button>
          </div>
        </div>

        {uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              上传进度: {uploadProgress}%
            </p>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-5 mb-6 w-full">
            <h2 className="text-lg font-semibold mb-4">新建图书</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">书名</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="输入书名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="输入作者"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBook.desc}
                  onChange={(e) => setNewBook({ ...newBook, desc: e.target.value })}
                  placeholder="输入简介"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleUpload}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    上传封面
                  </button>
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="图片链接或上传"
                    value={newBook.cover}
                    onChange={(e) => setNewBook({ ...newBook, cover: e.target.value })}
                  />
                  {newBook.cover && (
                    <img
                      src={newBook.cover.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(newBook.cover)}` : newBook.cover}
                      alt="封面"
                      className="w-10 h-14 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出版社</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                  placeholder="出版社"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出版日期</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBook.publish_date}
                  onChange={(e) => setNewBook({ ...newBook, publish_date: e.target.value })}
                  placeholder="出版日期"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  placeholder="ISBN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">页数</label>
                <input
                  type="number"
                  className="input w-full"
                  value={newBook.pages}
                  onChange={(e) => setNewBook({ ...newBook, pages: Number(e.target.value) })}
                  placeholder="页数"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={newBook.status || 'want'}
                  onChange={(e) => setNewBook({ ...newBook, status: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="want">想读</option>
                  <option value="reading">在读</option>
                  <option value="finished">已读</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
                <input
                  type="number"
                  className="input w-full"
                  value={newBook.rating}
                  onChange={(e) => setNewBook({ ...newBook, rating: Number(e.target.value) })}
                  placeholder="评分"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                取消
              </button>
              <button className="btn btn-primary" onClick={handleAddBook}>
                保存
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden w-full flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === books.length && books.length > 0}
                    onChange={(e) =>
                      setSelectedIds(e.target.checked ? books.map((b) => b.id) : [])
                    }
                  />
                </th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">封面</th>
                <th
                  className="px-6 py-3 cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  书名
                  {sortBy === 'title' && (
                    <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 cursor-pointer"
                  onClick={() => handleSort('author')}
                >
                  作者
                  {sortBy === 'author' && (
                    <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3">简介</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(book.id)}
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked
                            ? [...selectedIds, book.id]
                            : selectedIds.filter((id) => id !== book.id)
                        )
                      }
                    />
                  </td>
                  <td className="px-6 py-4">{book.id}</td>
                  <td className="px-6 py-4">
                    {editingBook && editingBook.id === book.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          className="input flex-1"
                          value={editingBook.cover}
                          onChange={(e) =>
                            setEditingBook({ ...editingBook, cover: e.target.value })
                          }
                        />
                        {editingBook.cover && (
                          <img
                            src={editingBook.cover.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(editingBook.cover)}` : editingBook.cover}
                            alt="封面"
                            className="w-8 h-12 object-cover rounded"
                          />
                        )}
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleUpload}
                          ref={fileInputRef}
                        />
                        <button
                          className="btn btn-secondary btn-xs"
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          上传
                        </button>
                      </div>
                    ) : (
                      book.cover && (
                        <img
                          src={book.cover.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(book.cover)}` : book.cover}
                          alt="封面"
                          className="w-8 h-12 object-cover rounded"
                        />
                      )
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingBook && editingBook.id === book.id ? (
                      <input
                        type="text"
                        className="input py-1 px-2 text-sm w-full"
                        value={editingBook.title}
                        onChange={(e) =>
                          setEditingBook({ ...editingBook, title: e.target.value })
                        }
                      />
                    ) : (
                      <span>{book.title}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingBook && editingBook.id === book.id ? (
                      <input
                        type="text"
                        className="input py-1 px-2 text-sm w-full"
                        value={editingBook.author}
                        onChange={(e) =>
                          setEditingBook({ ...editingBook, author: e.target.value })
                        }
                      />
                    ) : (
                      <span>{book.author}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingBook && editingBook.id === book.id ? (
                      <input
                        type="text"
                        className="input py-1 px-2 text-sm w-full"
                        value={editingBook.desc}
                        onChange={(e) =>
                          setEditingBook({ ...editingBook, desc: e.target.value })
                        }
                      />
                    ) : (
                      <span>{book.desc}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingBook && editingBook.id === book.id ? (
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
                          onClick={() => startEditing(book)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && (
            <div className="text-center py-10 text-gray-500">暂无图书</div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
            <span className="text-sm text-gray-600">
              共 {total} 条记录
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              上一页
            </button>
            <span className="px-3 py-1">
              第 {page} 页
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * pageSize >= total}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            className="btn btn-danger btn-sm ml-2"
            disabled={selectedIds.length === 0}
            onClick={handleBatchDelete}
          >
            批量删除
          </button>
        </div>
      </div>
    </div>
  );
} 