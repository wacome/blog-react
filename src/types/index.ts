export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover?: string;
  cover_image?: string;
  coverImage?: string;
  date: string;
  views: number;
  tags: Array<{
    id?: number;
    name?: string;
    slug?: string;
    count?: number;
  } | string>;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
  status?: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
  published: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  category?: {
    id: number;
    name: string;
  };
  authorType?: string;
}

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: string;
  email: string;
  website?: string;
  avatar?: string;
  post_id: number;
  parent_id?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count?: number;
} 