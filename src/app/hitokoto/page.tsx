'use client';
import { useEffect, useState } from 'react';
import { getHitokotos } from '@/api/hitokotoApi';

const PAGE_SIZE = 8;
const stickyColors = [
  'bg-[#fdf6b2] border-[#f5e79e]', // 柔和米黄
  'bg-[#d1f2eb] border-[#a3e4d7]', // 淡青绿
  'bg-[#d6eaff] border-[#a4cafe]', // 淡蓝
  'bg-[#ffe0e6] border-[#ffb3c6]', // 淡粉
  'bg-[#ede7f6] border-[#b39ddb]', // 淡紫
  'bg-[#fff3e0] border-[#ffcc80]', // 淡橙
  'bg-[#e0f7fa] border-[#80deea]', // 淡青
  'bg-[#f5f5f5] border-[#cccccc]', // 浅灰
];

export default function HitokotoPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getHitokotos()
      .then(data => setList(data.map((item: any) => ({
        ...item,
        source: item.source || item.author || '',
        created_at: item.created_at || item.createdAt || '',
      })))
      )
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const total = list.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pagedList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-3 bg-gradient-to-r from-[#d4b483] to-[#a3c293] bg-clip-text text-transparent">一言</h1>
      {loading ? <div>加载中...</div> : error ? <div className="text-red-500">{error}</div> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
            {pagedList.map((item, idx) => (
              <div
                key={item.id}
                className={`relative rounded-xl shadow-lg border p-6 min-h-[160px] flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-2xl ${stickyColors[idx % stickyColors.length]} before:content-[''] before:absolute before:-top-2 before:left-4 before:w-8 before:h-2 before:bg-white/60 before:rounded-full before:rotate-[-8deg]`}
                style={{ boxShadow: '0 4px 16px 0 rgba(0,0,0,0.06), 0 1.5px 0 0 #e5e7eb', borderWidth: 2 }}
              >
                <div className="text-lg font-semibold mb-2 text-gray-700 leading-relaxed break-words">“{item.content}”</div>
                <div className="text-right text-gray-500 text-xs mt-4 flex flex-col items-end">
                  <span>—— {item.source || '佚名'}</span>
                  <span className="mt-1">{item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : ''}</span>
                </div>
              </div>
            ))}
          </div>
          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >上一页</button>
              <span className="mx-2 text-gray-500">第 {page} / {totalPages} 页</span>
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 