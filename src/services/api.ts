import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Video, Tweet, News, ApiResponse, PaginatedResponse } from '../types';
import { mockVideos, mockTweets, mockNews } from '../mocks';

// Force using mock data to avoid any real API requests
const useMockData = true;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: useMockData ? 'http://localhost:3000' : 'https://api.cryptonews.com',
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
  async getLatestNews(page: number = 1, limit: number = 5): Promise<PaginatedResponse<News>> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to fetch latest news');
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = mockNews.slice(startIndex, endIndex);
      
      return {
        data: paginatedNews,
        page,
        limit,
        total: mockNews.length,
        hasMore: endIndex < mockNews.length,
      };
    }
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<News>>> = await apiClient.get(
      `/news/latest?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async getAllNews(page: number = 1, limit: number = 20): Promise<PaginatedResponse<News>> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to fetch news');
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = mockNews.slice(startIndex, endIndex);
      
      return {
        data: paginatedNews,
        page,
        limit,
        total: mockNews.length,
        hasMore: endIndex < mockNews.length,
      };
    }
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<News>>> = await apiClient.get(
      `/news?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async searchNews(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<News>> {
    if (useMockData) {
      await simulateNetworkDelay();
      
      if (simulateError()) {
        throw new Error('Failed to search news');
      }
      
      const filteredNews = mockNews.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.summary.toLowerCase().includes(query.toLowerCase()) ||
        news.content.toLowerCase().includes(query.toLowerCase())
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = filteredNews.slice(startIndex, endIndex);
      
      return {
        data: paginatedNews,
        page,
        limit,
        total: filteredNews.length,
        hasMore: endIndex < filteredNews.length,
      };
    }
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<News>>> = await apiClient.get(
      `/news/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;



