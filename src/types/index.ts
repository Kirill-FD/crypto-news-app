export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
}

export interface Tweet {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  url: string;
  likes?: number;
  retweets?: number;
  replies?: number;
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
  YouTubePlayer: { video: Video };
  RSS: undefined;
};
