import { Tweet } from '../types';

const now = new Date();

export const mockTweetDetails: Record<string, Tweet> = {
  'https://x.com/KirBro136/status/1991344709890109566': {
    id: 'tweet_kirbro_1',
    user: {
      id: 'kirbro136',
      name: 'Kirill Bro',
      handle: 'KirBro136',
      avatar: 'https://picsum.photos/200/200?random=21',
      verified: false,
    },
    text: 'Готовим обновление: подтягиваем реальные твиты из X для проверки UI и загрузки медиа.',
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    url: 'https://x.com/KirBro136/status/1991344709890109566',
    mediaUrl: 'https://picsum.photos/800/450?random=921',
    mediaType: 'image',
    likes: 124,
    retweets: 17,
    replies: 5,
  },
  'https://x.com/KirBro136/status/1988463903710613946': {
    id: 'tweet_kirbro_2',
    user: {
      id: 'kirbro136',
      name: 'Kirill Bro',
      handle: 'KirBro136',
      avatar: 'https://picsum.photos/200/200?random=21',
      verified: false,
    },
    text: 'Тестовый твит с ссылкой на видео — убедимся, что карточка корректно показывает предпросмотр.',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://x.com/KirBro136/status/1988463903710613946',
    mediaUrl: 'https://picsum.photos/800/450?random=922',
    mediaType: 'video',
    likes: 86,
    retweets: 9,
    replies: 3,
  },
  'https://x.com/Cristiano/status/1992686096980062618': {
    id: 'tweet_cr7',
    user: {
      id: 'cristiano',
      name: 'Cristiano Ronaldo',
      handle: 'Cristiano',
      avatar: 'https://picsum.photos/200/200?random=23',
      verified: true,
    },
    text: 'Training day complete. Focused on the next match! ⚽️',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    url: 'https://x.com/Cristiano/status/1992686096980062618',
    mediaUrl: 'https://picsum.photos/800/450?random=923',
    mediaType: 'image',
    likes: 12000,
    retweets: 2200,
    replies: 870,
  },
  'https://x.com/zafarmirzo/status/1991767760532304177': {
    id: 'tweet_zafar',
    user: {
      id: 'zafarmirzo',
      name: 'Zafar Mirzo',
      handle: 'zafarmirzo',
      avatar: 'https://picsum.photos/200/200?random=24',
      verified: true,
    },
    text: 'Building out the crypto news feed — checking how X embeds render media blocks.',
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    url: 'https://x.com/zafarmirzo/status/1991767760532304177',
    mediaUrl: 'https://picsum.photos/800/450?random=924',
    mediaType: 'image',
    likes: 640,
    retweets: 103,
    replies: 24,
  },
  'https://x.com/elonmusk/status/1992824577848672533': {
    id: 'tweet_elon',
    user: {
      id: 'elonmusk',
      name: 'Elon Musk',
      handle: 'elonmusk',
      avatar: 'https://picsum.photos/200/200?random=25',
      verified: true,
    },
    text: 'Starship next flight preparations underway. Big day ahead.',
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    url: 'https://x.com/elonmusk/status/1992824577848672533',
    mediaUrl: 'https://picsum.photos/800/450?random=925',
    mediaType: 'image',
    likes: 54000,
    retweets: 8200,
    replies: 3100,
  },
};

export const resolveMockTweetByUrl = (url: string): Tweet => {
  if (mockTweetDetails[url]) {
    return mockTweetDetails[url];
  }

  const createdAt = new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000).toISOString();

  return {
    id: `tweet_${url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24)}`,
    user: {
      id: 'unknown_user',
      name: 'Unknown Author',
      handle: 'unknown',
      avatar: 'https://picsum.photos/200/200?random=99',
      verified: false,
    },
    text: `Embedded tweet preview for ${url}`,
    createdAt,
    url,
    mediaType: undefined,
  };
};