import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Video, PaginatedResponse } from '../types';

// Query keys
export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (filters: string) => [...videoKeys.lists(), { filters }] as const,
  latest: () => [...videoKeys.all, 'latest'] as const,
};

// Get latest video for home page
export const useLatestVideo = () => {
  return useQuery({
    queryKey: videoKeys.latest(),
    queryFn: () => apiService.getLatestVideo(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Get all videos with pagination
export const useVideos = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: videoKeys.lists(),
    queryFn: ({ pageParam = 1 }) => apiService.getVideos(pageParam, limit),
    getNextPageParam: (lastPage: PaginatedResponse<Video>) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};



