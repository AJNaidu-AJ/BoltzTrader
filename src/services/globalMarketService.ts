interface MarketRegion {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  exchanges: string[];
  tradingHours: {
    open: string;
    close: string;
  };
}

interface GlobalMarketData {
  region: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
  exchange: string;
  lastUpdate: string;
}

class GlobalMarketService {
  private regions: MarketRegion[] = [
    {
      id: 'us',
      name: 'United States',
      timezone: 'America/New_York',
      currency: 'USD',
      exchanges: ['NYSE', 'NASDAQ'],
      tradingHours: { open: '09:30', close: '16:00' }
    },
    {
      id: 'eu',
      name: 'Europe',
      timezone: 'Europe/London',
      currency: 'EUR',
      exchanges: ['LSE', 'EURONEXT'],
      tradingHours: { open: '08:00', close: '16:30' }
    },
    {
      id: 'asia',
      name: 'Asia Pacific',
      timezone: 'Asia/Tokyo',
      currency: 'JPY',
      exchanges: ['TSE', 'HKEX'],
      tradingHours: { open: '09:00', close: '15:00' }
    }
  ];

  async getRegions(): Promise<MarketRegion[]> {
    return this.regions;
  }

  async getMarketData(region: string, symbols: string[] = []): Promise<GlobalMarketData[]> {
    const regionConfig = this.regions.find(r => r.id === region);
    if (!regionConfig) throw new Error(`Unknown region: ${region}`);

    // Mock data - replace with actual API calls
    const mockSymbols = symbols.length > 0 ? symbols : this.getDefaultSymbols(region);
    
    return mockSymbols.map(symbol => ({
      region,
      symbol,
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      currency: regionConfig.currency,
      exchange: regionConfig.exchanges[0],
      lastUpdate: new Date().toISOString()
    }));
  }

  async getGlobalIndices(): Promise<GlobalMarketData[]> {
    const indices = [
      { symbol: 'SPY', region: 'us', name: 'S&P 500' },
      { symbol: 'EFA', region: 'eu', name: 'MSCI EAFE' },
      { symbol: 'EWJ', region: 'asia', name: 'Nikkei 225' }
    ];

    return Promise.all(
      indices.map(async (index) => {
        const data = await this.getMarketData(index.region, [index.symbol]);
        return data[0];
      })
    );
  }

  async getCurrencyRates(baseCurrency = 'USD'): Promise<Record<string, number>> {
    // Mock exchange rates - integrate with forex API
    const rates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35
    };

    if (baseCurrency !== 'USD') {
      const baseRate = rates[baseCurrency];
      Object.keys(rates).forEach(currency => {
        rates[currency] = rates[currency] / baseRate;
      });
    }

    return rates;
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    
    const rates = await this.getCurrencyRates(from);
    return amount * rates[to];
  }

  isMarketOpen(region: string): boolean {
    const regionConfig = this.regions.find(r => r.id === region);
    if (!regionConfig) return false;

    const now = new Date();
    const timeZone = regionConfig.timezone;
    const currentTime = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);

    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const [openHour, openMinute] = regionConfig.tradingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = regionConfig.tradingHours.close.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  private getDefaultSymbols(region: string): string[] {
    const symbols = {
      us: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
      eu: ['ASML', 'SAP', 'LVMH', 'NESN', 'ROCHE'],
      asia: ['7203.T', '9984.T', '6758.T', '9434.T', '8306.T']
    };
    return symbols[region as keyof typeof symbols] || [];
  }
}

export const globalMarketService = new GlobalMarketService();
export type { MarketRegion, GlobalMarketData };