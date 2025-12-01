export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  publishedAt: string;
  /** Краткое описание видео (используется для превью/виджетов) */
  description?: string;
  /** Продолжительность видео в формате mm:ss или hh:mm:ss */
  duration?: string;
  /** Количество просмотров на YouTube */
  viewCount?: number;
}

export interface Tweet {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  url: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes?: number;
  retweets?: number;
  replies?: number;
  embedHtml?: string; // HTML код для встроенного виджета Twitter
}

export interface NewsTag {
  id?: string | number;
  name: string;
  slug?: string;
}

export interface NewsTicker {
  id?: string;
  symbol: string;
  name?: string;
  slug?: string;
  imageUrl?: string | null;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  imageUrl?: string | null;
  source?: string;
  sourceUrl?: string;
  category?: string;
  tags?: NewsTag[];
  tickers?: NewsTicker[];
}

export interface NewsFeedPage {
  cursor?: string | null;
  nextCursor?: string | null;
  hasMore: boolean;
  items: News[];
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export type TabParamList = {
  Home: undefined;
  X: undefined;
  YouTube: undefined;
  RSS: undefined;
};

export type StackParamList = {
  Home: undefined;
  X: undefined;
  YouTube: undefined;
  RSS: undefined;
};
