import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Tweet, PaginatedResponse } from '../types';

// Query keys
export const tweetKeys = {
  all: ['tweets'] as const,
  lists: () => [...tweetKeys.all, 'list'] as const,
  list: (filters: string) => [...tweetKeys.lists(), { filters }] as const,
  latest: () => [...tweetKeys.all, 'latest'] as const,
};

// Get latest tweet for home page
export const useLatestTweet = () => {
  return useQuery({
    queryKey: tweetKeys.latest(),
    queryFn: () => apiService.getLatestTweet(),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Get all tweets with pagination
export const useTweets = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: tweetKeys.lists(),
    queryFn: ({ pageParam = 1 }) => apiService.getTweets(pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<Tweet>) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Get tweets by user
export const useTweetsByUser = (handle: string, limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: [...tweetKeys.all, 'user', handle],
    queryFn: ({ pageParam = 1 }) => apiService.getTweets(pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<Tweet>) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: handle.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      // Filter by user on client side since we're using mock data
      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          data: page.data.filter(tweet => tweet.user.handle === handle),
        })),
      };
    },
  });
};



