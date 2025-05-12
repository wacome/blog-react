import React, { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  content: string;
  className?: string;
}

function parseMarkdownHeadings(content: string): TocItem[] {
  const lines = content.split('\n');
  const headings: TocItem[] = [];
  const idSet = new Set<string>();
  lines.forEach(line => {
    const match = /^(#{1,3})\s+(.+)$/.exec(line);
    if (match) {
      const level = match[1].length;
      let text = match[2].replace(/[#*`~\[\]]/g, '').trim();
      let id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
      // 保证id唯一
      let origId = id, i = 1;
      while (idSet.has(id)) { id = origId + '-' + (i++); }
      idSet.add(id);
      headings.push({ id, text, level });
    }
  });
  return headings;
}

const TOC: React.FC<TOCProps> = ({ content, className }) => {
  const [activeId, setActiveId] = useState<string>('');
  const toc = parseMarkdownHeadings(content);

  useEffect(() => {
    // 给正文标题加id
    toc.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) {
        const heading = Array.from(document.querySelectorAll('h1, h2, h3')).find(h => h.textContent?.replace(/[#*`~\[\]]/g, '').trim() === item.text);
        if (heading) heading.setAttribute('id', item.id);
      }
    });
    // 监听滚动，高亮当前标题
    const onScroll = () => {
      let cur = '';
      for (let i = toc.length - 1; i >= 0; i--) {
        const el = document.getElementById(toc[i].id);
        if (el && el.getBoundingClientRect().top < 120) {
          cur = toc[i].id;
          break;
        }
      }
      setActiveId(cur);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [content]);

  if (!toc.length) return null;

  return (
    <aside className={className ? className : "fixed top-36 left-20 z-30 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 w-64 max-h-[70vh] overflow-auto border border-[#e5e7eb]"}>
      <div className="flex items-center mb-4 justify-center">
        <svg className="w-6 h-6 mr-2 text-[#6b88a6]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        <span className="text-lg font-bold text-[#6b88a6] tracking-wide">文章目录</span>
      </div>
      <ol className="space-y-2">
        {toc.map(item => (
          <li key={item.id} className="">
            <a
              href={`#${item.id}`}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`block pl-${(item.level - 1) * 4} font-medium transition text-sm rounded-lg py-1 px-2 cursor-pointer select-none
                ${activeId === item.id
                  ? 'text-white bg-[#6b88a6] shadow'
                  : 'text-gray-800 hover:bg-[#f3f6fa] hover:text-[#6b88a6]'}
              `}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
};

export default TOC; 