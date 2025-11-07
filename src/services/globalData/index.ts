// Global Data Services Index
export { 
  fetchGlobalIndices, 
  fetchCryptoMarkets, 
  fetchForexMarkets 
} from './globalMarketService';

// Service configuration
export const MARKET_CONFIG = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  API_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  SUPPORTED_INDICES: [
    'NIFTY50', 'SP500', 'NASDAQ', 'DAX', 'NIKKEI'
  ],
  SUPPORTED_CRYPTO: [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT'
  ],
  SUPPORTED_FOREX: [
    'EURUSD', 'GBPUSD', 'USDJPY'
  ]
};

// Market status helper
export const getMarketStatus = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Simple market hours check (can be enhanced)
  if (hour >= 9 && hour <= 16) {
    return 'OPEN';
  } else if (hour >= 17 && hour <= 23) {
    return 'AFTER_HOURS';
  } else {
    return 'CLOSED';
  }
};