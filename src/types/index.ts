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

export interface News {
  id: string;
  title: string;
  image: string;
  summary: string;
  content: string;
  publishedAt: string;
  sourceUrl: string;
  source: string;
  category?: string;
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
