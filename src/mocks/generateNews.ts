import { News } from '../types';

const newsTitles = [
  'Bitcoin Reaches New Milestone as Institutional Adoption Accelerates',
  'Ethereum 2.0 Upgrade Reduces Energy Consumption by 99.95%',
  'Major Bank Announces Plans to Launch Cryptocurrency Trading Services',
  'DeFi Protocol Raises $50M in Series A Funding Round',
  'Regulatory Clarity Brings New Wave of Crypto Investments',
  'NFT Marketplace Sees Record-Breaking Sales Volume This Month',
  'Central Bank Digital Currency Pilot Program Shows Promising Results',
  'Cryptocurrency Mining Becomes More Sustainable with Renewable Energy',
  'Web3 Startup Secures Partnership with Fortune 500 Company',
  'Layer 2 Scaling Solution Processes 1 Million Transactions Per Second',
  'Crypto Hedge Fund Reports 300% Returns for Q4 2024',
  'Blockchain Technology Transforms Supply Chain Management',
  'Smart Contract Platform Launches Revolutionary DeFi Protocol',
  'Digital Asset Custody Services Gain Regulatory Approval',
  'Metaverse Real Estate Sales Surge as Virtual Worlds Expand',
  'Cross-Chain Bridge Enables Seamless Token Transfers',
  'Privacy-Focused Cryptocurrency Gains Traction Among Users',
  'Staking Rewards Reach All-Time High Across Multiple Networks',
  'Decentralized Exchange Surpasses Centralized Rivals in Volume',
  'Crypto Education Initiative Reaches 1 Million Students Globally',
  'Quantum-Resistant Cryptography Protects Future Blockchain Security',
  'Tokenized Real Estate Platform Democratizes Property Investment',
  'GameFi Sector Attracts $2B in Venture Capital Funding',
  'Cryptocurrency Tax Software Simplifies Compliance for Investors',
  'Blockchain Voting System Ensures Transparent Elections',
];

const newsSummaries = [
  'The cryptocurrency market continues to evolve with new technological breakthroughs and regulatory developments shaping the future of digital assets.',
  'Investors are increasingly recognizing the long-term value proposition of blockchain technology and its potential to transform traditional finance.',
  'Recent developments in the crypto space highlight the growing mainstream acceptance and institutional adoption of digital currencies.',
  'The intersection of technology and finance continues to create new opportunities for innovation and economic growth.',
  'Regulatory frameworks are beginning to provide clarity for businesses and investors operating in the cryptocurrency ecosystem.',
  'DeFi protocols are revolutionizing traditional financial services by offering decentralized alternatives to banking and lending.',
  'NFT technology is expanding beyond digital art to include real-world assets and utility-driven applications.',
  'Layer 2 solutions are addressing scalability challenges and reducing transaction costs for blockchain networks.',
  'Institutional investors are allocating significant capital to cryptocurrency investments as part of portfolio diversification strategies.',
  'The metaverse economy is creating new opportunities for digital asset ownership and virtual world interactions.',
];

const newsContent = [
  'The cryptocurrency landscape has experienced unprecedented growth and development in recent years. Major technological advancements, including the successful implementation of Ethereum 2.0 and the continued evolution of Bitcoin\'s Lightning Network, have significantly improved the scalability and efficiency of blockchain networks. These developments have not only enhanced user experience but also attracted significant institutional interest from major corporations and financial institutions. The growing acceptance of digital assets as legitimate investment vehicles has contributed to increased market capitalization and mainstream adoption. Regulatory clarity in key markets has provided businesses with the confidence to integrate cryptocurrency solutions into their operations. This convergence of technological innovation, institutional adoption, and regulatory support has created a robust foundation for the continued growth of the cryptocurrency ecosystem.',
  
  'The decentralized finance (DeFi) sector continues to revolutionize traditional financial services by offering innovative solutions for lending, borrowing, and trading without intermediaries. Smart contract platforms have enabled the creation of sophisticated financial instruments that operate transparently and autonomously. The total value locked in DeFi protocols has reached record highs, demonstrating strong user confidence in these decentralized systems. Cross-chain interoperability solutions have expanded the reach of DeFi applications across multiple blockchain networks, creating a more connected and efficient ecosystem. The integration of artificial intelligence and machine learning technologies is further enhancing the capabilities of DeFi protocols, enabling more sophisticated risk assessment and automated market making. These developments are reshaping the financial landscape and providing users with greater control over their financial assets.',
  
  'The intersection of blockchain technology and real-world applications continues to expand across various industries. Supply chain management, healthcare, and real estate are among the sectors experiencing significant transformation through blockchain implementation. Smart contracts are automating complex business processes and reducing the need for intermediaries in various transactions. The tokenization of real-world assets is democratizing access to previously illiquid investments, allowing smaller investors to participate in markets that were previously restricted to institutional players. Privacy-focused cryptocurrencies and zero-knowledge proof technologies are addressing growing concerns about data security and user privacy in the digital age. These innovations are creating new economic models and business opportunities that were not possible with traditional technologies.',
];

const sources = [
  'CoinDesk',
  'CoinTelegraph',
  'Decrypt',
  'The Block',
  'CryptoSlate',
  'Bitcoin Magazine',
  'Ethereum World News',
  'Crypto News',
  'Blockchain News',
  'Digital Asset News',
];

export const generateNews = (count: number = 30): News[] => {
  const news: News[] = [];
  
  for (let i = 0; i < count; i++) {
    const title = newsTitles[i % newsTitles.length];
    const summary = newsSummaries[i % newsSummaries.length];
    const content = newsContent[i % newsContent.length];
    const source = sources[i % sources.length];
    const publishedAt = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const category = ['Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Regulation', 'Technology'][i % 6];
    const tickerSymbol = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'MATIC'][i % 6];

    news.push({
      id: `news_${i + 1}`,
      title,
      imageUrl: `https://picsum.photos/400/250?random=${i + 200}`,
      summary,
      content,
      publishedAt,
      sourceUrl: `https://example.com/news/${i + 1}`,
      source,
      category,
      tags: [
        {
          id: i + 1,
          name: category,
          slug: category.toLowerCase(),
        },
      ],
      tickers: [
        {
          id: `ticker_${i + 1}`,
          symbol: tickerSymbol,
          name: category,
          slug: category.toLowerCase(),
          imageUrl: `https://picsum.photos/64/64?random=${i + 400}`,
        },
      ],
    });
  }
  
  return news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};



