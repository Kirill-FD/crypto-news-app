import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { News, PaginatedResponse } from '../types';

// Query keys
export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (filters: string) => [...newsKeys.lists(), { filters }] as const,
  latest: () => [...newsKeys.all, 'latest'] as const,
  search: (query: string) => [...newsKeys.all, 'search', query] as const,
};

// Get latest news for home page
export const useLatestNews = (limit: number = 5) => {
  return useQuery({
    queryKey: newsKeys.latest(),
    queryFn: () => apiService.getLatestNews(1, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Get all news with pagination
export const useAllNews = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: newsKeys.lists(),
    queryFn: ({ pageParam = 1 }) => apiService.getAllNews(pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<News>) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Search news
export const useSearchNews = (query: string, limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: newsKeys.search(query),
    queryFn: ({ pageParam = 1 }) => apiService.searchNews(query, pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<News>) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Get news by category
export const useNewsByCategory = (category: string, limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: [...newsKeys.all, 'category', category],
    queryFn: ({ pageParam = 1 }) => apiService.getAllNews(pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<News>) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      // Filter by category on client side since we're using mock data
      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          data: page.data.filter(news => news.category === category),
        })),
      };
    },
  });
};



