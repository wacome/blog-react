"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { formatFileSize, formatDate } from "../../../utils/format";
import { imageApi, type Image } from "@/api/image";

type SortOrder = "asc" | "desc";

// 工具函数：统一图片代理
function getImageSrc(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export default function ImageManagement() {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDetail, setShowDetail] = useState<Image | null>(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const backend = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  const loadImages = async () => {
    try {
      setLoading(true);
      setError("");
      const { data, error } = await imageApi.getImages({
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
        throw new Error('获取图片列表失败');
      }

      setImages(data.images || []);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取图片列表失败");
      setImages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [page, pageSize, sortBy, sortOrder, search]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data, error } = await imageApi.uploadImage(file);

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('上传图片失败');
      }

      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传图片失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这张图片吗？")) return;

    try {
      setLoading(true);
      setError("");
      await imageApi.deleteImage(id);
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除图片失败");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 张图片吗？`)) return;

    try {
      setLoading(true);
      setError("");
      await imageApi.batchDeleteImages(selectedIds);
      setSelectedIds([]);
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量删除图片失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadImages();
  };

  return (
    <div className="p-2 md:p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">图片管理</h1>
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索图片..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              搜索
            </button>
          </form>
          <label className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
            上传图片
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              批量删除 ({selectedIds.length})
            </button>
          )}
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={images.length > 0 && selectedIds.length === images.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(images.map((img) => img.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预览
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("filename")}
                >
                  文件名
                  {sortBy === "filename" && (
                    <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("size")}
                >
                  大小
                  {sortBy === "size" && (
                    <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  上传时间
                  {sortBy === "created_at" && (
                    <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    加载中...
                  </td>
                </tr>
              ) : images.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    暂无图片
                  </td>
                </tr>
              ) : (
                images.map((image) => (
                  <tr key={image.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(image.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, image.id]);
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== image.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getImageSrc(image.url)}
                        alt={image.filename}
                        className="h-10 w-10 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{image.filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatFileSize(image.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(image.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setShowDetail(image)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">每页显示:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded mr-2 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="mx-2">
            第 {page} 页，共 {Math.ceil(total / pageSize)} 页
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">图片详情</h2>
              <button
                onClick={() => setShowDetail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-6">
              <div className="flex-1">
                <img
                  src={getImageSrc(showDetail.url)}
                  alt={showDetail.filename}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="flex-1">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">文件名</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {showDetail.filename}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">文件大小</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatFileSize(showDetail.size)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">文件类型</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {showDetail.type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">上传时间</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(showDetail.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">图片尺寸</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {showDetail.width} x {showDetail.height} 像素
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 