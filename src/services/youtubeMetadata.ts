import axios from 'axios';

export interface YouTubeMetadata {
  title: string;
  description: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}

/**
 * Получает метаданные YouTube видео по его ID или URL.
 * Использует комбинацию oEmbed API и парсинг страницы для получения всех данных.
 */
export async function fetchYouTubeMetadata(
  videoIdOrUrl: string
): Promise<YouTubeMetadata | null> {
  try {
    // Извлекаем ID из URL, если передан URL
    const videoId = extractVideoId(videoIdOrUrl);
    if (!videoId) {
      console.warn('[YouTubeMetadata] Не удалось извлечь ID из:', videoIdOrUrl);
      return null;
    }

    // Используем oEmbed API для получения базовых данных
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    try {
      const oEmbedResponse = await axios.get(oEmbedUrl, { timeout: 10000 });
      const oEmbedData = oEmbedResponse.data;

      // Для получения duration и viewCount используем альтернативный метод
      // Парсим страницу YouTube через неофициальный эндпоинт
      const pageData = await fetchVideoPageData(videoId);

      return {
        title: oEmbedData.title || `YouTube video ${videoId}`,
        description: oEmbedData.author_name 
          ? `Video by ${oEmbedData.author_name}` 
          : pageData.description || '',
        duration: pageData.duration || '',
        viewCount: pageData.viewCount || 0,
        publishedAt: pageData.publishedAt || new Date().toISOString(),
      };
    } catch (oEmbedError: any) {
      console.warn('[YouTubeMetadata] oEmbed API failed, trying alternative method:', oEmbedError.message);
      
      // Fallback: пытаемся получить данные через парсинг страницы
      const pageData = await fetchVideoPageData(videoId);
      
      if (!pageData.title) {
        return null;
      }

      return {
        title: pageData.title,
        description: pageData.description || '',
        duration: pageData.duration || '',
        viewCount: pageData.viewCount || 0,
        publishedAt: pageData.publishedAt || new Date().toISOString(),
      };
    }
  } catch (error: any) {
    console.error('[YouTubeMetadata] Ошибка получения метаданных:', error.message);
    return null;
  }
}

/**
 * Извлекает ID видео из URL или возвращает сам ID, если передан ID
 */
function extractVideoId(videoIdOrUrl: string): string | null {
  // Если это уже ID (только буквы, цифры, дефисы и подчеркивания)
  if (/^[a-zA-Z0-9_-]{11,}$/.test(videoIdOrUrl)) {
    return videoIdOrUrl;
  }

  // Пытаемся извлечь из URL
  const patterns = [
    /[?&]v=([^&#]+)/, // watch?v=ID
    /youtu\.be\/([^?&#/]+)/, // youtu.be/ID
    /youtube\.com\/embed\/([^?&#/]+)/, // embed/ID
  ];

  for (const pattern of patterns) {
    const match = videoIdOrUrl.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Получает данные со страницы YouTube через парсинг HTML
 */
async function fetchVideoPageData(videoId: string): Promise<{
  title: string;
  description: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Парсим HTML страницы
    const pageResponse = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = pageResponse.data;
    
    // Метод 1: Извлекаем из ytInitialPlayerResponse (самый надежный)
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/);
    if (playerResponseMatch) {
      try {
        const playerData = JSON.parse(playerResponseMatch[1]);
        const videoDetails = playerData?.videoDetails;
        
        if (videoDetails) {
          const durationSeconds = parseInt(videoDetails.lengthSeconds || '0', 10);
          const viewCount = parseInt(videoDetails.viewCount || '0', 10);
          
          return {
            title: videoDetails.title || '',
            description: videoDetails.shortDescription || videoDetails.description || '',
            duration: formatDuration(durationSeconds),
            viewCount,
            publishedAt: new Date().toISOString(),
          };
        }
      } catch (parseError) {
        // ignore, пробуем другие методы
      }
    }

    // Метод 2: Извлекаем из ytInitialData
    const ytInitialDataMatch = html.match(/var ytInitialData = ({.+?});/);
    if (ytInitialDataMatch) {
      try {
        const data = JSON.parse(ytInitialDataMatch[1]);
        const videoDetails = extractFromYtInitialData(data);
        if (videoDetails && videoDetails.title) {
          return videoDetails;
        }
      } catch (parseError) {
        // ignore
      }
    }

    // Метод 3: Извлекаем из JSON-LD
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/gs);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonLd = JSON.parse(match.replace(/<script type="application\/ld\+json">|<\/script>/g, ''));
          if (jsonLd['@type'] === 'VideoObject') {
            const durationSeconds = parseDuration(jsonLd.duration);
            return {
              title: jsonLd.name || '',
              description: jsonLd.description || '',
              duration: formatDuration(durationSeconds),
              viewCount: parseInt(jsonLd.interactionStatistic?.userInteractionCount || '0', 10),
              publishedAt: jsonLd.uploadDate || new Date().toISOString(),
            };
          }
        } catch (parseError) {
          // ignore, пробуем следующий
        }
      }
    }

    // Метод 4: Парсим из og:title и других meta тегов
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const ogDescriptionMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    
    if (ogTitleMatch) {
      return {
        title: ogTitleMatch[1] || '',
        description: ogDescriptionMatch?.[1] || '',
        duration: '',
        viewCount: 0,
        publishedAt: new Date().toISOString(),
      };
    }

    // Если ничего не получилось, возвращаем пустые значения
    return {
      title: '',
      description: '',
      duration: '',
      viewCount: 0,
      publishedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.warn('[YouTubeMetadata] Ошибка парсинга страницы:', error.message);
    return {
      title: '',
      description: '',
      duration: '',
      viewCount: 0,
      publishedAt: new Date().toISOString(),
    };
  }
}

/**
 * Извлекает данные из ytInitialData объекта
 */
function extractFromYtInitialData(data: any): {
  title: string;
  description: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
} | null {
  try {
    // Пробуем разные пути к данным в зависимости от структуры YouTube
    let videoDetails = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
    let secondaryInfo = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer;
    
    // Альтернативный путь
    if (!videoDetails) {
      videoDetails = data?.contents?.singleColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
      secondaryInfo = data?.contents?.singleColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer;
    }
    
    if (!videoDetails) {
      return null;
    }

    const title = videoDetails.title?.runs?.[0]?.text || 
                  videoDetails.title?.simpleText || 
                  '';
    
    const viewCountText = videoDetails.viewCount?.videoViewCountRenderer?.viewCount?.simpleText || 
                         videoDetails.viewCount?.videoViewCountRenderer?.viewCount?.runs?.[0]?.text ||
                         videoDetails.viewCount?.simpleText ||
                         '';
    const viewCount = parseViewCount(viewCountText);
    
    const description = secondaryInfo?.description?.runs?.map((run: any) => run.text).join('') || 
                       secondaryInfo?.description?.simpleText ||
                       '';
    
    // Пытаемся найти duration в разных местах
    const microformat = data?.microformat?.playerMicroformatRenderer;
    const durationSeconds = microformat?.lengthSeconds ? parseInt(microformat.lengthSeconds, 10) : 0;
    const duration = formatDuration(durationSeconds);
    const publishedAt = microformat?.publishDate || new Date().toISOString();

    if (!title) {
      return null;
    }

    return {
      title,
      description,
      duration,
      viewCount,
      publishedAt,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Форматирует длительность из секунд в mm:ss или hh:mm:ss
 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Парсит duration из ISO 8601 формата (PT1H2M3S) в секунды
 */
function parseDuration(duration: string): number {
  if (!duration) return 0;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Парсит количество просмотров из строки (например, "1.2M views" -> 1200000)
 */
function parseViewCount(viewCountText: string): number {
  if (!viewCountText) return 0;

  // Убираем "views" и пробелы, оставляем только число и множитель
  const cleaned = viewCountText.replace(/[^\d.,KMkm]/g, '').trim();
  
  const multipliers: Record<string, number> = {
    K: 1000,
    M: 1000000,
    B: 1000000000,
  };

  const match = cleaned.match(/^([\d.,]+)([KMkmB]?)$/);
  if (!match) return 0;

  const number = parseFloat(match[1].replace(',', '.'));
  const multiplier = multipliers[match[2].toUpperCase()] || 1;

  return Math.floor(number * multiplier);
}

