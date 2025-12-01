import { Video } from '../types';

/**
 * Полная ссылка на видео YouTube + необходимые метаданные для превью.
 * Достаточно добавить новую ссылку, чтобы ролик появился в списке и/или в избранном.
 */
export interface YouTubeVideoLink {
  url: string;
  title?: string;
  description?: string;
  duration?: string;
  viewCount?: number;
  publishedAt?: string;
}

export const getYoutubeIdFromUrl = (url: string): string => {
  try {
    const idFromParam = url.match(/[?&]v=([^&#]+)/)?.[1];
    if (idFromParam) return idFromParam;

    const shortMatch = url.match(/youtu\.be\/([^?&#/]+)/);
    if (shortMatch?.[1]) return shortMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#/]+)/);
    if (embedMatch?.[1]) return embedMatch[1];

    if (/^[a-zA-Z0-9_-]{6,}$/.test(url)) {
      return url;
    }
  } catch {
    // ignore
  }
  return url;
};

/**
 * Единый список всех YouTube-видео приложения.
 * Здесь ты добавляешь новые ссылки и (опционально) метаданные.
 */
export const YOUTUBE_VIDEO_LINKS: YouTubeVideoLink[] = [
  {
    url: 'https://www.youtube.com/watch?v=h_bdUSLkPD0',
  },
  {
    url: 'https://www.youtube.com/watch?v=1H97qf-kkBk',
  },
  {
    url: 'https://www.youtube.com/watch?v=Bxl4nxIxBdA',
  },
  {
    url: 'https://www.youtube.com/watch?v=RHhmnPnrZaE&t=1177s',
    
  },
  {
    url: 'https://www.youtube.com/watch?v=nsmVxsYylq0',
  },
  {
    url: 'https://www.youtube.com/watch?v=YAxWJ5JQKoE',
  },
  {
    url: 'https://www.youtube.com/watch?v=9kpaEM4nBes',
  },
  {
    url: 'https://www.youtube.com/watch?v=CF7m0ited_Y',
  },
];

/**
 * Массив Video, который используется списком YouTube.
 */
export const YOUTUBE_VIDEOS: Video[] = YOUTUBE_VIDEO_LINKS.map((item, index) => {
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

/**
 * Список избранных видео задаётся только ссылками — порядок и выбор,
 * а все данные берутся из YOUTUBE_VIDEOS.
 */
export const FEATURED_VIDEO_URLS: string[] = [
  'https://www.youtube.com/watch?v=h_bdUSLkPD0',
  'https://www.youtube.com/watch?v=1H97qf-kkBk',
  'https://www.youtube.com/watch?v=Bxl4nxIxBdA',
  'https://www.youtube.com/watch?v=RHhmnPnrZaE&t=1177s',
  'https://www.youtube.com/watch?v=nsmVxsYylq0',
  'https://www.youtube.com/watch?v=YAxWJ5JQKoE',
  'https://www.youtube.com/watch?v=9kpaEM4nBes',
  'https://www.youtube.com/watch?v=CF7m0ited_Y',
];

const findVideoByUrl = (url: string): Video | undefined => {
  const youtubeId = getYoutubeIdFromUrl(url);
  return YOUTUBE_VIDEOS.find(video => video.youtubeId === youtubeId);
};

export const FEATURED_VIDEOS: Video[] = FEATURED_VIDEO_URLS
  .map(url => findVideoByUrl(url))
  .filter((video): video is Video => Boolean(video));

