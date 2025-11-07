import { logAudit } from '@/utils/auditLogger';

// Mock global market data service - replace with real APIs
export async function fetchGlobalIndices() {
  const symbols = {
    NIFTY50: { region: 'India', flag: '🇮🇳' },
    SP500: { region: 'USA', flag: '🇺🇸' },
    NASDAQ: { region: 'USA', flag: '🇺🇸' },
    DAX: { region: 'Germany', flag: '🇩🇪' },
    NIKKEI: { region: 'Japan', flag: '🇯🇵' }
  };

  const responses = await Promise.all(
    Object.entries(symbols).map(async ([name, info]) => {
      try {
        // Mock data generation - replace with real API calls
        const basePrice = Math.random() * 5000 + 1000;
        const change = (Math.random() - 0.5) * 4; // -2% to +2%
        
        console.log(`📊 Fetching ${name} data...`);
        
        return { 
          name, 
          symbol: name,
          price: basePrice, 
          change,
          region: info.region,
          flag: info.flag
        };
      } catch (e) {
        console.error(`Failed to fetch ${name}`, e);
        return { 
          name, 
          symbol: name,
          price: null, 
          change: null,
          region: info.region,
          flag: info.flag
        };
      }
    })
  );

  await logAudit('market_data', 'global_indices', 'FETCH', 'System', { 
    count: responses.length,
    symbols: Object.keys(symbols)
  });
  
  return responses;
}

export async function fetchCryptoMarkets() {
  const pairs = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' }
  ];

  const responses = await Promise.all(
    pairs.map(async (pair) => {
      try {
        // Mock crypto data - replace with Binance API
        const basePrice = pair.symbol === 'BTCUSDT' ? 45000 : 
                         pair.symbol === 'ETHUSDT' ? 2500 : 100;
        const change = (Math.random() - 0.5) * 10; // -5% to +5%
        
        console.log(`₿ Fetching ${pair.symbol} data...`);
        
        return { 
          symbol: pair.symbol,
          name: pair.name,
          price: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
          change
        };
      } catch (e) {
        console.error(`Failed to fetch ${pair.symbol}`, e);
        return { 
          symbol: pair.symbol,
          name: pair.name,
          price: null, 
          change: null 
        };
      }
    })
  );

  await logAudit('market_data', 'crypto_markets', 'FETCH', 'System', { 
    count: responses.length,
    pairs: pairs.map(p => p.symbol)
  });

  return responses;
}

export async function fetchForexMarkets() {
  const pairs = [
    { symbol: 'EURUSD', name: 'Euro/USD' },
    { symbol: 'GBPUSD', name: 'Pound/USD' },
    { symbol: 'USDJPY', name: 'USD/Yen' }
  ];

  const responses = pairs.map(pair => ({
    symbol: pair.symbol,
    name: pair.name,
    price: 1 + Math.random() * 0.5,
    change: (Math.random() - 0.5) * 2
  }));

  await logAudit('market_data', 'forex_markets', 'FETCH', 'System', { 
    count: responses.length 
  });

  return responses;
}