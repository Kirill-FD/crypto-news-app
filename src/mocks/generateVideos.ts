import { Video } from '../types';

const realYouTubeIds = [
  'dQw4w9WgXcQ', // Rick Roll (for testing)
  'jNQXAC9IVRw', // "How to tie a tie" - popular video
  'kJQP7kiw5Fk', // "Despacito" - Luis Fonsi
  '9bZkp7q19f0', // "Gangnam Style" - PSY
  'fJ9rUzIMcZQ', // "Bohemian Rhapsody" - Queen
  'hT_nvWreIhg', // "The Beatles - Come Together"
  'YQHsXMglC9A', // "Hello" - Adele
  'L_jWHffIx5E', // "Smells Like Teen Spirit" - Nirvana
  'RgKAFK5djSk', // "Wiz Khalifa - See You Again"
  '09R8_2nJtjg', // "Maroon 5 - Sugar"
];

const cryptoVideoTitles = [
  'Bitcoin Hits New All-Time High - What This Means for Crypto',
  'Ethereum 2.0 Staking Guide - Complete Tutorial',
  'Top 5 Altcoins to Watch in 2024',
  'How to Secure Your Crypto Wallet - Security Best Practices',
  'DeFi Explained: Decentralized Finance for Beginners',
  'NFT Market Analysis - Current Trends and Future Outlook',
  'Cardano vs Ethereum - Which Blockchain is Better?',
  'Crypto Tax Guide - How to Report Your Investments',
  'Mining Bitcoin in 2024 - Is It Still Profitable?',
  'Stablecoins Explained - USDT, USDC, and DAI',
  'Crypto Trading Strategies for Beginners',
  'Web3 and the Future of the Internet',
  'Layer 2 Solutions - Scaling Ethereum',
  'Crypto Regulation Updates - What You Need to Know',
  'Metaverse and Cryptocurrency - The Connection',
];

export const generateVideos = (count: number = 15): Video[] => {
  const videos: Video[] = [];
  
  for (let i = 0; i < count; i++) {
    const youtubeId = realYouTubeIds[i % realYouTubeIds.length];
    const title = cryptoVideoTitles[i % cryptoVideoTitles.length];
    const publishedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    videos.push({
      id: `video_${i + 1}`,
      title,
      thumbnail: `https://picsum.photos/320/180?random=${i + 100}`,
      youtubeId,
      publishedAt,
      duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      viewCount: Math.floor(Math.random() * 1000000) + 10000,
    });
  }
  
  return videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};



