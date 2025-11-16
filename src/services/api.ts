import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { Video, Tweet, News, ApiResponse, PaginatedResponse, NewsFeedPage } from '../types';
import { mockVideos, mockTweets, mockNews } from '../mocks';
import { storage, storageKeys } from '../store/storage';

// Determine mock mode from Expo public env var; default to real API
const useMockData = (process.env.EXPO_PUBLIC_USE_MOCK === '1' || process.env.EXPO_PUBLIC_USE_MOCK === 'true') ?? false;

// Resolve API base URL: allow override via env, fallback to deployed Cloud Run URL
const resolvedBaseUrl = useMockData
  ? 'http://localhost:3000'
  : (process.env.EXPO_PUBLIC_API_BASE || 'https://crypto-app-service-865815497825.europe-west1.run.app');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock delay simulation (kept minimal for quick UX while using mocks)
const simulateNetworkDelay = (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};

// Disable mock errors to always render test data successfully
const simulateError = (): boolean => {
  return false;
};

type FeedItemResponse = {
  id: string;
  title: string;
  summary: string;
  image_url?: string | null;
  published_at: string;
  tags?: string[];
  tickers?: string[];
};

type FeedResponse = {
  items: FeedItemResponse[];
  pagination?: {
    next_cursor?: string | null;
    has_more?: boolean;
  };
};

type ArticleTagResponse = {
  id?: number;
  name?: string;
  slug?: string;
};

type ArticleTickerResponse = {
  id?: string;
  symbol: string;
  name?: string;
  slug?: string;
  image_url?: string | null;
};

type ArticleResponse = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  image_url?: string | null;
  published_at: string;
  source?: string;
  source_url?: string;
  // Backend may return tags both as objects and as plain strings; support both
  tags?: (ArticleTagResponse | string)[];
  // Same for tickers: either objects or plain strings (symbols)
  tickers?: (ArticleTickerResponse | string)[];
};

type FeedRequestParams = {
  cursor?: string | null;
  limit?: number;
  tags?: string[];
  tickers?: string[];
};

const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';
const PLATFORM = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;
const DEFAULT_SOURCE = 'Crypto News Feed';

const slugify = (value?: string) => {
  if (!value) return undefined;
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

const generateUUID = (): string => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

type AnonymousAuthResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
};

class MobileApiAuthManager {
  private accessToken: string | null;
  private expiresAt: number | null;
  private pendingAuth?: Promise<string>;

  constructor() {
    this.accessToken = storage.getString(storageKeys.MOBILE_API_TOKEN) || null;
    const expiresValue = storage.getString(storageKeys.MOBILE_API_TOKEN_EXPIRES_AT);
    this.expiresAt = expiresValue ? Number(expiresValue) : null;
  }

  async getAccessToken(): Promise<string> {
    if (useMockData) {
      return '';
    }

    if (this.isTokenValid()) {
      return this.accessToken as string;
    }

    return this.requestToken();
  }

  async forceRefreshToken(): Promise<string> {
    return this.requestToken(true);
  }

  clearToken() {
    this.accessToken = null;
    this.expiresAt = null;
    storage.delete(storageKeys.MOBILE_API_TOKEN);
    storage.delete(storageKeys.MOBILE_API_TOKEN_EXPIRES_AT);
  }

  private isTokenValid(): boolean {
    if (!this.accessToken || !this.expiresAt) {
      return false;
    }
    const now = Date.now();
    return now + TOKEN_EXPIRY_BUFFER_MS < this.expiresAt;
  }

  private async requestToken(force = false): Promise<string> {
    if (!force && this.pendingAuth) {
      return this.pendingAuth;
    }

    this.pendingAuth = this.performAuth().finally(() => {
      this.pendingAuth = undefined;
    });

    return this.pendingAuth;
  }

  private async performAuth(): Promise<string> {
    const deviceId = this.getDeviceId();
    const payload = {
      device_id: deviceId,
      app_version: APP_VERSION,
      platform: PLATFORM,
    };

    const response: AxiosResponse<AnonymousAuthResponse> = await axios.post(
      `${resolvedBaseUrl}/auth/anonymous`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const { access_token, expires_in } = response.data;
    const expiresAt = Date.now() + (expires_in ?? 86400) * 1000;

    this.accessToken = access_token;
    this.expiresAt = expiresAt;

    storage.set(storageKeys.MOBILE_API_TOKEN, access_token);
    storage.set(storageKeys.MOBILE_API_TOKEN_EXPIRES_AT, expiresAt.toString());

    return access_token;
  }

  private getDeviceId(): string {
    const existing = storage.getString(storageKeys.MOBILE_API_DEVICE_ID);
    if (existing) {
      return existing;
    }
    const newDeviceId = generateUUID();
    storage.set(storageKeys.MOBILE_API_DEVICE_ID, newDeviceId);
    return newDeviceId;
  }
}

const authManager = new MobileApiAuthManager();

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (useMockData) {
      return config;
    }

    const token = await authManager.getAccessToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (useMockData) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const originalRequest = error?.config as (InternalAxiosRequestConfig & { _retry?: boolean });

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      authManager.clearToken();
      await authManager.forceRefreshToken();
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Video endpoints
  async getLatestVideo(): Promise<Video> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to fetch latest video');
      }
      
      return mockVideos[0];
    }
    
    const response: AxiosResponse<ApiResponse<Video>> = await apiClient.get('/videos/latest');
    return response.data.data;
  }

  async getVideos(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Video>> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to fetch videos');
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedVideos = mockVideos.slice(startIndex, endIndex);
      
      return {
        data: paginatedVideos,
        page,
        limit,
        total: mockVideos.length,
        hasMore: endIndex < mockVideos.length,
      };
    }
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Video>>> = await apiClient.get(
      `/videos?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  // Tweet endpoints
  async getLatestTweet(): Promise<Tweet> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to fetch latest tweet');
      }
      
      return mockTweets[0];
    }
    
    const response: AxiosResponse<ApiResponse<Tweet>> = await apiClient.get('/tweets/latest');
    return response.data.data;
  }

  async getTweets(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Tweet>> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to fetch tweets');
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTweets = mockTweets.slice(startIndex, endIndex);
      
      return {
        data: paginatedTweets,
        page,
        limit,
        total: mockTweets.length,
        hasMore: endIndex < mockTweets.length,
      };
    }
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Tweet>>> = await apiClient.get(
      `/tweets?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  // News endpoints
  async getLatestNews(limit: number = 5): Promise<News[]> {
    const page = await this.fetchNewsFeed({ limit });
    return page.items;
  }

  async getAllNews(cursor?: string | null, limit: number = 20): Promise<NewsFeedPage> {
    return this.fetchNewsFeed({ cursor, limit });
  }

  async searchNews(query: string, cursor?: string | null, limit: number = 20): Promise<NewsFeedPage> {
    const page = await this.fetchNewsFeed({ cursor, limit });
    if (!query) {
      return page;
    }

    const normalizedQuery = query.toLowerCase();
    const filteredItems = page.items.filter(item => {
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.content.toLowerCase().includes(normalizedQuery)
      );
    });

    return {
      ...page,
      items: filteredItems,
    };
  }

  async getArticleById(id: string): Promise<News> {
    if (useMockData) {
      await simulateNetworkDelay();
      const article = mockNews.find(item => item.id === id);
      if (!article) {
        throw new Error('Article not found');
      }
      return article;
    }

    const response: AxiosResponse<ArticleResponse> = await apiClient.get(`/mapi/v1/articles/${id}`);
    return this.mapArticleResponse(response.data);
  }

  private async fetchNewsFeed(params: FeedRequestParams = {}): Promise<NewsFeedPage> {
    if (useMockData) {
      return this.getMockFeed(params);
    }

    const response: AxiosResponse<FeedResponse> = await apiClient.get('/mapi/v1/feed', {
      params: this.buildFeedQuery(params),
    });

    return this.mapFeedResponse(response.data, params.cursor || null);
  }

  private async getMockFeed(params: FeedRequestParams): Promise<NewsFeedPage> {
    await simulateNetworkDelay();

    if (simulateError()) {
      throw new Error('Failed to fetch mock news feed');
    }

    const limit = params.limit ?? 20;
    const offset = params.cursor ? Number(params.cursor) : 0;
    const safeOffset = Number.isFinite(offset) ? offset : 0;
    const items = mockNews.slice(safeOffset, safeOffset + limit);
    const nextCursor = safeOffset + limit < mockNews.length ? String(safeOffset + limit) : null;

    return {
      cursor: params.cursor || null,
      nextCursor,
      hasMore: Boolean(nextCursor),
      items,
    };
  }

  private buildFeedQuery(params: FeedRequestParams) {
    const query: Record<string, string> = {};
    if (params.cursor) {
      query.cursor = params.cursor;
    }
    if (params.limit) {
      query.limit = String(params.limit);
    }
    if (params.tags?.length) {
      query.tags = params.tags.join(',');
    }
    if (params.tickers?.length) {
      query.tickers = params.tickers.join(',');
    }
    return query;
  }

  private mapFeedResponse(response: FeedResponse, cursor: string | null): NewsFeedPage {
    const pagination = response.pagination ?? {};
    const items = response.items ?? [];
    return {
      cursor,
      nextCursor: pagination.next_cursor ?? null,
      hasMore: Boolean(pagination.has_more),
      items: items.map(item => this.mapFeedItem(item)),
    };
  }

  private mapFeedItem(item: FeedItemResponse): News {
    const tags = item.tags?.map(tag => ({
      name: tag,
      slug: slugify(tag),
    })) ?? [];

    const tickers = item.tickers?.map(symbol => ({
      symbol,
      name: symbol,
      slug: slugify(symbol),
    })) ?? [];

    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.summary,
      imageUrl: item.image_url ?? undefined,
      publishedAt: item.published_at,
      source: DEFAULT_SOURCE,
      category: tags[0]?.name,
      tags,
      tickers,
    };
  }

  private mapArticleResponse(article: ArticleResponse): News {
    const rawTags = article.tags ?? [];
    const rawTickers = article.tickers ?? [];

    const tags = rawTags.map((tag, index) => {
      if (typeof tag === 'string') {
        const name = tag.trim();
        return {
          id: index,
          name,
          slug: slugify(name),
        };
      }

      const baseName = tag.name || tag.slug || `Tag ${index + 1}`;
      return {
        id: tag.id ?? index,
        name: baseName,
        slug: tag.slug ?? slugify(baseName),
      };
    });

    const tickers = rawTickers.map((ticker, index) => {
      if (typeof ticker === 'string') {
        const symbol = ticker.trim();
        return {
          id: index.toString(),
          symbol,
          name: symbol,
          slug: slugify(symbol),
          imageUrl: undefined,
        };
      }

      const baseSymbol = ticker.symbol || ticker.name || `TICKER_${index + 1}`;
      return {
        id: ticker.id ?? index.toString(),
        symbol: baseSymbol,
        name: ticker.name ?? baseSymbol,
        slug: ticker.slug ?? slugify(baseSymbol),
        imageUrl: ticker.image_url,
      };
    });

    return {
      id: article.id,
      title: article.title,
      summary: article.summary || article.content || '',
      content: article.content || article.summary || '',
      imageUrl: article.image_url ?? undefined,
      publishedAt: article.published_at,
      source: article.source || DEFAULT_SOURCE,
      sourceUrl: article.source_url,
      category: tags[0]?.name,
      tags,
      tickers,
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;



