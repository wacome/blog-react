'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getImageSrc } from '@/utils/getImageSrc';
import { bookApi } from '@/api/book';

interface Book {
  id: number;
  title: string;
  author: string;
  desc: string;
  cover: string;
  publisher: string;
  publish_date: string;
  isbn: string;
  pages: number;
  rating: number;
  status: string;
  created_at: string;
  updated_at: string;
  edges: {
    owner: {
      id: number;
      username: string;
      email: string;
      role: string;
      avatar: string;
      created_at: string;
      updated_at: string;
    };
  };
}

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await bookApi.getBooks();
        if (response.data && response.data.books) {
          setBooks(response.data.books);
        } else {
          setBooks([]);
        }
        setLoading(false);
      } catch (err) {
        setError('获取书籍列表失败');
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'want':
        return '想读';
      case 'reading':
        return '在读';
      case 'finished':
        return '读完';
      default:
        return status;
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <span className="block w-1 h-10 bg-[#6b88a6] rounded-sm mr-3"></span>
        <span className="bg-gradient-to-r from-[#d4b483] to-[#a3c293] bg-clip-text text-transparent">书籍列表</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setSelectedBook(book)}
          >
            <img
              src={getImageSrc(book.cover)}
              alt={book.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-gray-600">作者: {book.author}</p>
              <p className="text-gray-600">状态: {getStatusText(book.status)}</p>
              <p className="text-gray-600">评分: {book.rating}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-modal-pop"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors text-2xl"
              onClick={() => setSelectedBook(null)}
              aria-label="关闭"
            >
              ×
            </button>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img
                src={getImageSrc(selectedBook.cover)}
                alt={selectedBook.title}
                className="w-40 h-56 object-cover rounded-xl shadow-md border border-gray-200 mb-4 md:mb-0"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">{selectedBook.title}</h2>
                <ul className="text-gray-700 space-y-1 text-base">
                  <li><span className="font-semibold">作者：</span>{selectedBook.author}</li>
                  <li><span className="font-semibold">出版社：</span>{selectedBook.publisher}</li>
                  <li><span className="font-semibold">出版日期：</span>{selectedBook.publish_date}</li>
                  <li><span className="font-semibold">ISBN：</span>{selectedBook.isbn}</li>
                  <li><span className="font-semibold">页数：</span>{selectedBook.pages}</li>
                  <li><span className="font-semibold">我的评分：</span>{selectedBook.rating}</li>
                  <li><span className="font-semibold">状态：</span>{getStatusText(selectedBook.status)}</li>
                </ul>
              </div>
            </div>
            {selectedBook.desc && (
              <div className="mt-6 text-gray-600 text-base leading-relaxed border-t pt-4">{selectedBook.desc}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage; 