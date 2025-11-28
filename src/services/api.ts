import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { Video, Tweet, News, ApiResponse, PaginatedResponse, NewsFeedPage } from '../types';
// import { mockVideos, mockTweets, mockNews } from '../mocks';
import { mockVideos, mockTweets, mockNews, resolveMockTweetByUrl } from '../mocks';
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

  private extractUsernameFromUrl(url: string): { username: string; handle: string } | null {
    // Extract username from URLs like: https://x.com/username/status/123456
    // or https://twitter.com/username/status/123456
    const match = url.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status/);
    if (match && match[1]) {
      const handle = match[1];
      // Capitalize first letter and add spaces for username
      const username = handle
        .split('')
        .map((char, i) => (i === 0 ? char.toUpperCase() : char === char.toUpperCase() ? ` ${char}` : char))
        .join('');
      return { username, handle };
    }
    return null;
  }

  private async fetchTweetEmbedHtml(url: string): Promise<string | undefined> {
    try {
      // Use Twitter oEmbed API to get embed HTML
      const normalizedUrl = url.replace('x.com', 'twitter.com');
      const response = await axios.get('https://publish.twitter.com/oembed', {
        params: {
          url: normalizedUrl,
          omit_script: false,
          lang: 'en',
          theme: 'light',
        },
        timeout: 10000,
      });
      
      if (response?.data?.html) {
        return response.data.html;
      }
    } catch (error: any) {
      console.warn('Failed to fetch tweet embed HTML:', error?.message);
    }
    return undefined;
  }

  private async fetchTweetFromX(url: string): Promise<Tweet> {
    // Extract username from URL as fallback
    const urlInfo = this.extractUsernameFromUrl(url);
    const defaultUsername = urlInfo?.username || 'User';
    const defaultHandle = urlInfo?.handle || 'user';
    const defaultAvatar = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';

    // Fetch embed HTML in parallel
    const embedHtmlPromise = this.fetchTweetEmbedHtml(url);

    try {
      // Normalize URL format - Twitter API prefers twitter.com over x.com
      const normalizedUrl = url.replace('x.com', 'twitter.com');
      
      // Try first method: using url parameter
      let response;
      try {
        response = await axios.get('https://cdn.syndication.twimg.com/tweet-result', {
          params: { 
            url: normalizedUrl,
            lang: 'en',
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 15000,
        });
      } catch (firstError: any) {
        // If first method fails, try with tweet ID
        const tweetId = url.match(/\/status\/(\d+)/)?.[1];
        if (tweetId) {
          response = await axios.get('https://cdn.syndication.twimg.com/tweet-result', {
            params: { 
              id: tweetId,
              lang: 'en',
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 15000,
          });
        } else {
          throw firstError;
        }
      }

      const payload = response?.data ?? {};
      
      // If payload doesn't have expected structure, try alternative parsing
      if (!payload.user && !payload.text && !payload.full_text && !payload.tweet) {
        console.log('Empty or unexpected API response, using fallback data');
        // Return data extracted from URL - at least show user info
        const tweetId = url.match(/\/status\/(\d+)/)?.[1];
        const embedHtml = await embedHtmlPromise;
        return {
          id: tweetId || url,
          user: {
            id: defaultHandle,
            name: defaultUsername,
            handle: defaultHandle,
            avatar: defaultAvatar,
            verified: false,
          },
          text: `View tweet on X: @${defaultHandle}`,
          createdAt: new Date().toISOString(),
          url,
          mediaType: undefined,
          embedHtml,
        };
      }

      // Fetch embed HTML
      const embedHtml = await embedHtmlPromise;

      // Try to parse as embedded tweet data
      if (payload.tweet?.user) {
        return this.parseTweetPayload(payload.tweet, url, defaultUsername, defaultHandle, defaultAvatar, embedHtml);
      }

      return this.parseTweetPayload(payload, url, defaultUsername, defaultHandle, defaultAvatar, embedHtml);
    } catch (error: any) {
      console.warn('Failed to fetch tweet from X:', url, error?.message || error);
      
      // Try alternative API endpoint
      try {
        const tweetId = url.match(/\/status\/(\d+)/)?.[1];
        if (tweetId) {
          const altResponse = await axios.get(`https://cdn.syndication.twimg.com/tweet?id=${tweetId}&lang=en`, {
            timeout: 10000,
          });
          const altPayload = altResponse.data ?? {};
          if (altPayload.user || altPayload.text || altPayload.full_text) {
            const embedHtml = await this.fetchTweetEmbedHtml(url);
            return this.parseTweetPayload(altPayload, url, defaultUsername, defaultHandle, defaultAvatar, embedHtml);
          }
        }
      } catch (altError) {
        console.warn('Alternative API also failed:', altError);
      }

      // Final fallback - return data extracted from URL with more info
      const tweetId = url.match(/\/status\/(\d+)/)?.[1];
      const embedHtml = await this.fetchTweetEmbedHtml(url);
      return {
        id: tweetId || url,
        user: {
          id: defaultHandle,
          name: defaultUsername,
          handle: defaultHandle,
          avatar: defaultAvatar,
          verified: false,
        },
        text: `View tweet on X: @${defaultHandle}`,
        createdAt: new Date().toISOString(),
        url,
        mediaType: undefined,
        embedHtml,
      };
    }
  }

  private parseTweetPayload(
    payload: any,
    url: string,
    defaultUsername: string,
    defaultHandle: string,
    defaultAvatar: string,
    embedHtml?: string
  ): Tweet {
    const user = payload.user ?? {};
    const createdAtIso = payload.created_at 
      ? new Date(payload.created_at).toISOString() 
      : payload.createdAt 
      ? new Date(payload.createdAt).toISOString()
      : new Date().toISOString();

    // Extract media - prioritize photos, then videos
    let mediaUrl: string | undefined;
    let mediaType: Tweet['mediaType'] | undefined;

    // Check for photos first (images)
    if (payload.photos && Array.isArray(payload.photos) && payload.photos.length > 0) {
      const photo = payload.photos[0];
      mediaUrl = photo.url || photo.media_url_https || photo.media_url || photo.original_img_url;
      mediaType = 'image';
    }
    // Check for video (with poster/thumbnail)
    else if (payload.video) {
      const video = payload.video;
      mediaUrl = video.poster || video.thumbnail_url || video.content?.thumbnail?.url || video.variants?.[0]?.src;
      mediaType = 'video';
    }
    // Check for card/embed with image
    else if (payload.card) {
      const card = payload.card;
      if (card.photo?.imageValue) {
        mediaUrl = card.photo.imageValue;
        mediaType = 'image';
      } else if (card.player?.poster) {
        mediaUrl = card.player.poster;
        mediaType = 'video';
      }
    }
    // Check for media entities (alternative format)
    else if (payload.entities?.media && Array.isArray(payload.entities.media) && payload.entities.media.length > 0) {
      const media = payload.entities.media[0];
      if (media.type === 'photo') {
        mediaUrl = media.media_url_https || media.media_url;
        mediaType = 'image';
      } else if (media.type === 'video' || media.type === 'animated_gif') {
        mediaUrl = media.media_url_https || media.media_url || media.video_info?.variants?.[0]?.url;
        mediaType = 'video';
      }
    }
    // Check for legacy media format
    else if (payload.mediaDetails && Array.isArray(payload.mediaDetails) && payload.mediaDetails.length > 0) {
      const media = payload.mediaDetails[0];
      mediaUrl = media.media_url_https || media.media_url;
      mediaType = media.type === 'video' ? 'video' : 'image';
    }

    // Extract text - clean up URLs if needed
    let text = payload.full_text || payload.text || payload.content || payload.legacy?.full_text || '';
    
    // Remove media URLs from text if they're embedded
    if (payload.entities?.urls) {
      payload.entities.urls.forEach((urlEntity: any) => {
        if (urlEntity.expanded_url && (urlEntity.expanded_url.includes('pic.twitter.com') || urlEntity.expanded_url.includes('video'))) {
          text = text.replace(urlEntity.url, '');
        }
      });
    }
    text = text.trim() || `Tweet from @${user.screen_name || defaultHandle}`;

    // Extract user info with better fallbacks - ensure we always have valid values
    const userId = user.id_str || user.id || user.rest_id || defaultHandle;
    const userName = (user.name || user.display_name || user.screen_name || defaultUsername).trim() || defaultUsername;
    const userHandle = (user.screen_name || user.username || defaultHandle).trim() || defaultHandle;
    const userAvatar = (user.profile_image_url_https || user.profile_image_url || defaultAvatar).trim() || defaultAvatar;

    // Ensure text is not empty
    const finalText = text.trim() || `Tweet from @${userHandle}`;

    return {
      id: payload.id_str || payload.id || payload.rest_id || url.match(/\/status\/(\d+)/)?.[1] || url,
      user: {
        id: userId,
        name: userName,
        handle: userHandle,
        avatar: userAvatar,
        verified: Boolean(user.verified || user.is_blue_verified || user.verified_type),
      },
      text: finalText,
      createdAt: createdAtIso,
      url,
      mediaUrl,
      mediaType,
      likes: payload.favorite_count ?? payload.faves ?? payload.like_count ?? payload.legacy?.favorite_count ?? undefined,
      retweets: payload.retweet_count ?? payload.legacy?.retweet_count ?? undefined,
      replies: payload.reply_count ?? payload.conversation_count ?? payload.legacy?.reply_count ?? undefined,
      embedHtml,
    };
  }
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

  async getTweetByUrl(url: string): Promise<Tweet> {
    if (useMockData) {
      await simulateNetworkDelay();

      if (simulateError()) {
        throw new Error('Failed to resolve tweet by URL');
      }

      return resolveMockTweetByUrl(url);
    }

    const response: AxiosResponse<ApiResponse<Tweet>> = await apiClient.get('/tweets/by-url', {
      params: { url },
    });

    // If backend returns data, trust it; otherwise fetch directly from X
    if (response?.data?.data) {
      return response.data.data;
    }

    return this.fetchTweetFromX(url);
  }

  async getTweetsByUrls(urls: string[]): Promise<Tweet[]> {
    if (urls.length === 0) {
      return [];
    }

    if (useMockData) {
      await simulateNetworkDelay();

      return urls.map(url => resolveMockTweetByUrl(url));
    }

    // Try to fetch from backend API first
    try {
      const response: AxiosResponse<ApiResponse<Tweet[]>> = await apiClient.post('/tweets/by-url', { urls });

      if (response?.data?.data?.length && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (error: any) {
      // If backend API fails or returns empty, fall back to direct X fetch
      console.log('Backend API unavailable, fetching directly from X:', error?.message);
    }

    // Fallback: fetch directly from X/Twitter syndication API
    return Promise.all(urls.map(url => this.fetchTweetFromX(url)));
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



