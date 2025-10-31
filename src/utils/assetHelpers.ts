export const ASSET_TYPES = {
  EQUITY: 'equity',
  CRYPTO: 'crypto',
  ETF: 'etf'
} as const;

export type AssetType = typeof ASSET_TYPES[keyof typeof ASSET_TYPES];

export const ASSET_TYPE_CONFIG = {
  [ASSET_TYPES.EQUITY]: {
    label: 'Stocks',
    color: 'bg-blue-500',
    tradingHours: '9:30 AM - 4:00 PM EST',
    weekendTrading: false
  },
  [ASSET_TYPES.CRYPTO]: {
    label: 'Cryptocurrency',
    color: 'bg-orange-500',
    tradingHours: '24/7',
    weekendTrading: true
  },
  [ASSET_TYPES.ETF]: {
    label: 'ETFs',
    color: 'bg-green-500',
    tradingHours: '9:30 AM - 4:00 PM EST',
    weekendTrading: false
  }
};

export const detectAssetType = (symbol: string): AssetType => {
  // Crypto patterns
  if (symbol.includes('-USD') || symbol.includes('USDT') || 
      ['BTC', 'ETH', 'ADA', 'DOT', 'SOL', 'AVAX'].some(crypto => symbol.startsWith(crypto))) {
    return ASSET_TYPES.CRYPTO;
  }
  
  // ETF patterns
  if (['SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'EEM', 'GLD', 'SLV'].includes(symbol)) {
    return ASSET_TYPES.ETF;
  }
  
  // Default to equity
  return ASSET_TYPES.EQUITY;
};

export const formatAssetSymbol = (symbol: string, assetType: AssetType): string => {
  if (assetType === ASSET_TYPES.CRYPTO) {
    // Convert BTC-USD to BTCUSDT for Binance API
    return symbol.replace('-USD', 'USDT');
  }
  return symbol;
};

export const isMarketOpen = (assetType: AssetType): boolean => {
  if (assetType === ASSET_TYPES.CRYPTO) {
    return true; // Crypto markets are always open
  }
  
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  // Weekend check for traditional markets
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Market hours: 9:30 AM - 4:00 PM EST (simplified)
  return hour >= 9 && hour < 16;
};

export const getMarketStatus = (assetType: AssetType): 'open' | 'closed' | 'pre-market' | 'after-hours' => {
  if (assetType === ASSET_TYPES.CRYPTO) {
    return 'open';
  }
  
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  if (day === 0 || day === 6) {
    return 'closed';
  }
  
  if (hour < 9) {
    return 'pre-market';
  } else if (hour >= 16) {
    return 'after-hours';
  } else {
    return 'open';
  }
};