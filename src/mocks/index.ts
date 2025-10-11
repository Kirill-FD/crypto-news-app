import { generateVideos } from './generateVideos';
import { generateTweets } from './generateTweets';
import { generateNews } from './generateNews';

// Generate mock data
export const mockVideos = generateVideos(15);
export const mockTweets = generateTweets(25);
export const mockNews = generateNews(30);

// Export generators for dynamic data
export { generateVideos, generateTweets, generateNews };

