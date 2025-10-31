interface MarketDataResponse {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  assetType: 'equity' | 'crypto' | 'etf';
  timestamp: number;
}

class MarketDataService {
  private binanceUrl = import.meta.env.VITE_BINANCE_API_URL || 'https://api.binance.com/api/v3';
  private alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

  async getCryptoPrice(symbol: string): Promise<MarketDataResponse> {
    try {
      const binanceSymbol = symbol.replace('-USD', 'USDT');
      const [ticker, stats] = await Promise.all([
        fetch(`${this.binanceUrl}/ticker/price?symbol=${binanceSymbol}`),
        fetch(`${this.binanceUrl}/ticker/24hr?symbol=${binanceSymbol}`)
      ]);

      const priceData = await ticker.json();
      const statsData = await stats.json();

      return {
        symbol,
        name: symbol.replace('-USD', ''),
        price: parseFloat(priceData.price),
        change: parseFloat(statsData.priceChange),
        changePercent: parseFloat(statsData.priceChangePercent),
        volume: parseFloat(statsData.volume),
        assetType: 'crypto',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching crypto data for ${symbol}:`, error);
      return this.getMockData(symbol, 'crypto');
    }
  }

  async getEquityPrice(symbol: string): Promise<MarketDataResponse> {
    try {
      // Using Alpha Vantage API (fallback to mock for demo)
      if (!this.alphaVantageKey || this.alphaVantageKey === 'your-alpha-vantage-key') {
        return this.getMockData(symbol, 'equity');
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );
      const data = await response.json();
      const quote = data['Global Quote'];

      return {
        symbol,
        name: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        assetType: 'equity',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching equity data for ${symbol}:`, error);
      return this.getMockData(symbol, 'equity');
    }
  }

  async getETFPrice(symbol: string): Promise<MarketDataResponse> {
    // ETFs use same API as equities
    const data = await this.getEquityPrice(symbol);
    return { ...data, assetType: 'etf' };
  }

  async getMultiAssetData(symbols: string[]): Promise<MarketDataResponse[]> {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const assetType = this.detectAssetType(symbol);
        
        switch (assetType) {
          case 'crypto':
            return this.getCryptoPrice(symbol);
          case 'etf':
            return this.getETFPrice(symbol);
          default:
            return this.getEquityPrice(symbol);
        }
      })
    );

    return results;
  }

  private detectAssetType(symbol: string): 'equity' | 'crypto' | 'etf' {
    if (symbol.includes('-USD') || ['BTC', 'ETH', 'ADA', 'DOT'].some(crypto => symbol.startsWith(crypto))) {
      return 'crypto';
    }
    if (['SPY', 'QQQ', 'VTI', 'IWM'].includes(symbol)) {
      return 'etf';
    }
    return 'equity';
  }

  private getMockData(symbol: string, assetType: 'equity' | 'crypto' | 'etf'): MarketDataResponse {
    const basePrice = assetType === 'crypto' ? 30000 : 150;
    const volatility = assetType === 'crypto' ? 0.1 : 0.03;
    
    return {
      symbol,
      name: symbol,
      price: basePrice + (Math.random() - 0.5) * basePrice * 0.2,
      change: (Math.random() - 0.5) * basePrice * volatility,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      assetType,
      timestamp: Date.now()
    };
  }
}

export const marketDataService = new MarketDataService();