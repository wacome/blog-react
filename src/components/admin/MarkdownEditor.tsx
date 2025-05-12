'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <textarea
          className="input w-full h-[500px] font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入 Markdown 内容"
        />
      </div>
      <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none p-4 border rounded-lg bg-white markdown-body">
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
    </div>
  );
} 