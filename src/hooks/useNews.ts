import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { News, NewsFeedPage } from '../types';

// Query keys
export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (filters: string) => [...newsKeys.lists(), { filters }] as const,
  latest: (limit: number) => [...newsKeys.all, 'latest', limit] as const,
  search: (query: string) => [...newsKeys.all, 'search', query] as const,
  detail: (id: string) => [...newsKeys.all, 'detail', id] as const,
};

// Get latest news for home page
export const useLatestNews = (limit: number = 5) => {
  return useQuery({
    queryKey: newsKeys.latest(limit),
    queryFn: () => apiService.getLatestNews(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Get all news with pagination
export const useAllNews = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: newsKeys.lists(),
    queryFn: ({ pageParam = undefined }: { pageParam?: string | null }) =>
      apiService.getAllNews(pageParam, limit),
    getNextPageParam: (lastPage: NewsFeedPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Search news
export const useSearchNews = (query: string, limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: newsKeys.search(query),
    queryFn: ({ pageParam = undefined }: { pageParam?: string | null }) =>
      apiService.searchNews(query, pageParam, limit),
    getNextPageParam: (lastPage: NewsFeedPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
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
    queryFn: ({ pageParam = undefined }: { pageParam?: string | null }) =>
      apiService.getAllNews(pageParam, limit),
    getNextPageParam: (lastPage: NewsFeedPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      // Filter by category on client side since we're using mock data
      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          items: page.items.filter(news => news.category === category),
        })),
      };
    },
  });
};

export const useArticle = (articleId?: string) => {
  return useQuery({
    queryKey: articleId ? newsKeys.detail(articleId) : [...newsKeys.all, 'detail', 'unknown'],
    queryFn: () => apiService.getArticleById(articleId as string),
    enabled: Boolean(articleId),
    // Always refetch full article on screen mount to ensure we have complete content
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};



