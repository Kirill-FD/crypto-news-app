import { useState, useEffect, useMemo, useRef } from 'react';
import { Video } from '../types';
import { 
  YOUTUBE_VIDEO_LINKS, 
  FEATURED_VIDEO_URLS, 
  getYoutubeIdFromUrl 
} from '../constants/featuredVideos';
import { fetchYouTubeMetadata } from '../services/youtubeMetadata';

/**
 * Создаёт уникальный ключ из массива ссылок для отслеживания изменений
 */
const createConfigKey = (links: typeof YOUTUBE_VIDEO_LINKS): string => {
  return links.map(link => link.url).join('|');
};

/**
 * Хук для получения списка YouTube видео с автоматической загрузкой метаданных.
 * Если метаданные не указаны в конфиге, они будут загружены автоматически по ссылке.
 * Автоматически обновляется при изменении конфига без полной перезагрузки страницы.
 */
export function useYouTubeVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadedVideosRef = useRef<Map<string, Video>>(new Map());
  const configKeyRef = useRef<string>('');

  // Создаём ключ конфига для отслеживания изменений
  // Пересчитывается при каждом рендере, чтобы отслеживать изменения в конфиге
  const currentConfigKey = createConfigKey(YOUTUBE_VIDEO_LINKS);

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      // Если конфиг не изменился, используем кэш
      if (currentConfigKey === configKeyRef.current && loadedVideosRef.current.size > 0) {
        const cachedVideos = Array.from(loadedVideosRef.current.values());
        setVideos(cachedVideos);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Сначала создаём базовый список видео из конфига
        const baseVideos: Video[] = YOUTUBE_VIDEO_LINKS.map((item, index) => {
          const youtubeId = getYoutubeIdFromUrl(item.url);

          return {
            id: youtubeId || `youtube_video_${index}`,
            youtubeId,
            title: item.title ?? `YouTube video #${index + 1}`,
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
            publishedAt: item.publishedAt ?? new Date().toISOString(),
            description: item.description,
            duration: item.duration,
            viewCount: item.viewCount,
          };
        });

        // Определяем, какие видео нужно загрузить (новые или без метаданных)
        const videosToLoad = baseVideos.filter((video, index) => {
          const link = YOUTUBE_VIDEO_LINKS[index];
          const cached = loadedVideosRef.current.get(video.youtubeId);
          
          // Если видео уже загружено и конфиг не изменился, пропускаем
          if (cached && currentConfigKey === configKeyRef.current) {
            return false;
          }
          
          // Если метаданные отсутствуют, нужно загрузить
          return !link.title || !link.description || !link.duration || !link.viewCount;
        });

        // Загружаем метаданные только для новых видео или тех, у которых они отсутствуют
        const enrichedVideos = await Promise.all(
          baseVideos.map(async (video, index) => {
            const link = YOUTUBE_VIDEO_LINKS[index];
            const cached = loadedVideosRef.current.get(video.youtubeId);
            
            // Если все метаданные уже есть в конфиге, возвращаем видео как есть
            if (link.title && link.description && link.duration && link.viewCount) {
              loadedVideosRef.current.set(video.youtubeId, video);
              return video;
            }

            // Если видео уже загружено и конфиг не изменился, используем кэш
            if (cached && currentConfigKey === configKeyRef.current) {
              return cached;
            }

            // Загружаем метаданные только для новых видео
            const metadata = await fetchYouTubeMetadata(video.youtubeId);
            
            if (!metadata) {
              loadedVideosRef.current.set(video.youtubeId, video);
              return video; // Если не удалось загрузить, возвращаем с дефолтными значениями
            }

            // Объединяем существующие данные с загруженными (приоритет у существующих)
            const enrichedVideo = {
              ...video,
              title: link.title || metadata.title || video.title,
              description: link.description || metadata.description || video.description,
              duration: link.duration || metadata.duration || video.duration,
              viewCount: link.viewCount || metadata.viewCount || video.viewCount,
              publishedAt: link.publishedAt || metadata.publishedAt || video.publishedAt,
            };
            
            loadedVideosRef.current.set(video.youtubeId, enrichedVideo);
            return enrichedVideo;
          })
        );

        if (isMounted) {
          setVideos(enrichedVideos);
          setIsLoading(false);
          configKeyRef.current = currentConfigKey;
        }
      } catch (error) {
        console.error('[useYouTubeVideos] Ошибка загрузки видео:', error);
        if (isMounted) {
          // В случае ошибки возвращаем базовый список
          const fallbackVideos: Video[] = YOUTUBE_VIDEO_LINKS.map((item, index) => {
            const youtubeId = getYoutubeIdFromUrl(item.url);
            const video = {
              id: youtubeId || `youtube_video_${index}`,
              youtubeId,
              title: item.title ?? `YouTube video #${index + 1}`,
              thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
              publishedAt: item.publishedAt ?? new Date().toISOString(),
              description: item.description,
              duration: item.duration,
              viewCount: item.viewCount,
            };
            loadedVideosRef.current.set(youtubeId, video);
            return video;
          });
          setVideos(fallbackVideos);
          setIsLoading(false);
          configKeyRef.current = currentConfigKey;
        }
      }
    }

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, [currentConfigKey]);

  return { videos, isLoading };
}

/**
 * Хук для получения избранных видео с автоматической загрузкой метаданных.
 */
export function useFeaturedVideos() {
  const { videos, isLoading } = useYouTubeVideos();

  const featuredVideos = useMemo(() => {
    return FEATURED_VIDEO_URLS
      .map(url => {
        const youtubeId = getYoutubeIdFromUrl(url);
        return videos.find(video => video.youtubeId === youtubeId);
      })
      .filter((video): video is Video => Boolean(video));
  }, [videos]);

  return { featuredVideos, isLoading };
}

