"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { postApi } from '@/api/postApi';
import { tagApi } from '@/api/tagApi';
import Link from "next/link";
import MarkdownIt from 'markdown-it';
import 'prismjs/themes/prism.css';
import MarkdownItPrism from 'markdown-it-prism';

const md = new MarkdownIt().use(MarkdownItPrism);

export default function EditPostPage() {
  const router = useRouter();
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: false,
    tags: [],
    author: '',
    authorType: 'original',
  });
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    postApi.getPost(Number(id))
      .then(({ data: post, error }) => {
        if (error) throw new Error(error);
        if (!post) throw new Error('文章不存在');
        setForm({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          coverImage: post.cover || post.cover_image || post.coverImage || '',
          published: post.status === 'published',
          tags: Array.isArray(post.tags) ? post.tags.map((t: any) => typeof t === 'string' ? t : t.name) : [],
          author: (post.author as any)?.username || (post.author as any)?.name || '',
          authorType: (post as any)?.authorType || (post as any)?.author_type || 'original',
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    tagApi.getTags().then((res: any) => {
      let tags: any[] = Array.isArray(res) ? res : res?.data;
      if (!tags) return;
      setAllTags(tags.map((t: any) => t.name));
    });
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await postApi.updatePost(Number(id), form);
      if (error) throw new Error(error);
      alert('保存成功！');
      router.push('/admin/posts');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 标签添加
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev: any) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };
  // 标签删除
  const handleRemoveTag = (tag: string) => {
    setForm((prev: any) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }));
  };

  // 工具栏插入markdown
  const insertAtCursor = (before: string, after: string = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    setForm((prev: any) => ({ ...prev, content: newValue }));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + selected.length + after.length;
    }, 0);
  };

  // 插入表格
  const handleInsertTable = () => {
    const table = `| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |`;
    insertAtCursor('\n' + table + '\n');
  };

  // 插入LaTeX代码块
  const handleInsertLatex = () => {
    const latex = '\n```latex\n% 这里写LaTeX公式\n\\frac{a}{b}\\sqrt{x}\\int_0^1 x^2 dx\n```\n';
    insertAtCursor(latex);
  };

  // 插入图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      const url = data.url;
      insertAtCursor('![](' + url + ')');
    } catch (e) {
      setError('图片上传失败');
    }
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <form onSubmit={handleSubmit} className="flex flex-row gap-8">
        {/* 左侧表单区 */}
        <div className="w-1/2 space-y-4">
          <div>
            <label className="form-label">标题</label>
            <input className="input" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">摘要</label>
            <textarea className="textarea" name="excerpt" value={form.excerpt} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">封面图片URL</label>
            <input className="input" name="coverImage" value={form.coverImage} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">标签</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 bg-primary/20 rounded text-sm">
                  {tag}
                  <button type="button" className="ml-1 text-red-500" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="输入标签后回车或点击添加"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                list="all-tags"
              />
              <datalist id="all-tags">
                {allTags.map(tag => <option key={tag} value={tag} />)}
              </datalist>
              <button type="button" className="btn btn-secondary" onClick={handleAddTag}>添加</button>
            </div>
          </div>
          <div>
            <label className="form-label">作者</label>
            <input className="input" name="author" value={form.author} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">作者类型</label>
            <select className="input" name="authorType" value={form.authorType} onChange={handleChange}>
              <option value="original">原创</option>
              <option value="repost">转载</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="published" checked={form.published} onChange={handleChange} id="published" />
            <label htmlFor="published" className="ml-2">已发布</label>
          </div>
          <div className="flex justify-between mt-6">
            <button type="submit" className="btn btn-primary">保存</button>
            <Link href="/admin/posts" className="btn btn-secondary">返回</Link>
          </div>
        </div>
        {/* 右侧内容编辑与预览区 */}
        <div className="w-1/2 space-y-4">
          <div>
            <label className="form-label">内容（Markdown 支持）</label>
            {/* 富文本工具栏 */}
            <div className="flex gap-2 mb-2">
              <button type="button" className="btn btn-secondary px-2" title="加粗" onClick={() => insertAtCursor('**', '**', '加粗文本')}>B</button>
              <button type="button" className="btn btn-secondary px-2" title="斜体" onClick={() => insertAtCursor('*', '*', '斜体文本')}>I</button>
              <button type="button" className="btn btn-secondary px-2" title="标题" onClick={() => insertAtCursor('\n# ', '', '一级标题')}>H1</button>
              <button type="button" className="btn btn-secondary px-2" title="插入表格" onClick={handleInsertTable}>表格</button>
              <button type="button" className="btn btn-secondary px-2" title="插入LaTeX代码块" onClick={handleInsertLatex}>LaTeX</button>
              <label className="btn btn-secondary px-2 cursor-pointer" title="插入图片">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                图片
              </label>
            </div>
            <textarea ref={textareaRef} className="textarea h-64 border-2 border-gray-200 focus:border-primary" name="content" value={form.content} onChange={handleChange} rows={18} required />
          </div>
          <div>
            <label className="form-label">实时预览</label>
            <div 
              className="markdown-content bg-gray-50 rounded p-4 min-h-[200px] border border-gray-200 shadow-inner" 
              style={{maxHeight: 400, overflowY: 'auto'}} 
              dangerouslySetInnerHTML={{ 
                __html: md.render(form.content || '').replace(
                  /<img src="(.*?)"/g, 
                  (match, src) => `<img src="${src.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(src)}` : src}"`
                )
              }} 
            />
          </div>
        </div>
      </form>
    </div>
  );
} 