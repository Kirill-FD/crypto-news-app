import { Tweet } from '../types';

const cryptoUsers = [
  { id: 'user_1', name: 'Vitalik Buterin', handle: 'VitalikButerin', avatar: 'https://picsum.photos/200/200?random=1', verified: true },
  { id: 'user_2', name: 'Elon Musk', handle: 'elonmusk', avatar: 'https://picsum.photos/200/200?random=2', verified: true },
  { id: 'user_3', name: 'Crypto Daily', handle: 'CryptoDaily', avatar: 'https://picsum.photos/200/200?random=3', verified: false },
  { id: 'user_4', name: 'CoinDesk', handle: 'CoinDesk', avatar: 'https://picsum.photos/200/200?random=4', verified: true },
  { id: 'user_5', name: 'Anthony Pompliano', handle: 'APompliano', avatar: 'https://picsum.photos/200/200?random=5', verified: true },
  { id: 'user_6', name: 'CZ Binance', handle: 'cz_binance', avatar: 'https://picsum.photos/200/200?random=6', verified: true },
  { id: 'user_7', name: 'Coinbase', handle: 'coinbase', avatar: 'https://picsum.photos/200/200?random=7', verified: true },
  { id: 'user_8', name: 'CryptoWendyO', handle: 'CryptoWendyO', avatar: 'https://picsum.photos/200/200?random=8', verified: false },
  { id: 'user_9', name: 'Brian Armstrong', handle: 'brian_armstrong', avatar: 'https://picsum.photos/200/200?random=9', verified: true },
  { id: 'user_10', name: 'Michael Saylor', handle: 'saylor', avatar: 'https://picsum.photos/200/200?random=10', verified: true },
];

const tweetTexts = [
  'Bitcoin is the future of money. The network effect is real and growing stronger every day. #Bitcoin #Crypto',
  'Ethereum 2.0 is finally here! The merge was successful and we\'re seeing massive improvements in energy efficiency. #Ethereum',
  'Just bought more $BTC. Dollar cost averaging is the way to go in this volatile market. #HODL',
  'The DeFi ecosystem continues to innovate. New protocols are launching every week with incredible yields. #DeFi',
  'NFTs are not just JPEGs. They represent ownership, utility, and community in the digital age. #NFTs',
  'Regulation is coming to crypto, and that\'s actually a good thing for long-term adoption. #CryptoRegulation',
  'Staking rewards are looking great this month. Passive income from crypto is becoming more accessible. #Staking',
  'Web3 is the next evolution of the internet. We\'re building the future right now. #Web3',
  'Metaverse and crypto go hand in hand. Virtual economies need digital currencies. #Metaverse',
  'Layer 2 solutions are scaling Ethereum beautifully. Gas fees are finally manageable. #Layer2',
  'Institutional adoption of Bitcoin is accelerating. Corporations are adding BTC to their balance sheets. #Institutional',
  'Crypto education is crucial for mass adoption. We need to make complex concepts accessible to everyone.',
  'The halving cycle is one of Bitcoin\'s most important features. Scarcity drives value. #BitcoinHalving',
  'Smart contracts are revolutionizing how we think about agreements and automation. #SmartContracts',
  'Cross-chain interoperability is the key to the future of blockchain technology. #Interoperability',
  'Privacy coins are more important than ever in our surveillance economy. #Privacy',
  'Meme coins can be fun, but always DYOR before investing. Most are just pump and dump schemes.',
  'The Lightning Network is making Bitcoin payments instant and cheap. This is huge for adoption.',
  'Stablecoins are bridging traditional finance and crypto. They\'re the gateway to DeFi for many users.',
  'Governance tokens are giving users a voice in protocol decisions. This is true decentralization.',
];

export const generateTweets = (count: number = 25): Tweet[] => {
  const tweets: Tweet[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = cryptoUsers[i % cryptoUsers.length];
    const text = tweetTexts[i % tweetTexts.length];
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    tweets.push({
      id: `tweet_${i + 1}`,
      user,
      text,
      createdAt,
      url: `https://twitter.com/${user.handle}/status/${Math.random().toString(36).substr(2, 9)}`,
      likes: Math.floor(Math.random() * 10000) + 100,
      retweets: Math.floor(Math.random() * 2000) + 50,
      replies: Math.floor(Math.random() * 500) + 10,
    });
  }
  
  return tweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
