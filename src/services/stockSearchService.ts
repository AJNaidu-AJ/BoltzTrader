// Stock Search Service using Zerodha Kite API
export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  instrument_token: string;
  lot_size: number;
  tick_size: number;
}

class StockSearchService {
  private instruments: Stock[] = [];
  private initialized = false;

  // Mock instruments data (replace with actual Zerodha API call)
  private mockInstruments: Stock[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', instrument_token: '738561', lot_size: 1, tick_size: 0.05 },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', instrument_token: '2953217', lot_size: 1, tick_size: 0.05 },
    { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', instrument_token: '408065', lot_size: 1, tick_size: 0.05 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', instrument_token: '341249', lot_size: 1, tick_size: 0.05 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', instrument_token: '1270529', lot_size: 1, tick_size: 0.05 },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', instrument_token: '779521', lot_size: 1, tick_size: 0.05 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', instrument_token: '2714625', lot_size: 1, tick_size: 0.05 },
    { symbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE', instrument_token: '424961', lot_size: 1, tick_size: 0.05 },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', instrument_token: '2939649', lot_size: 1, tick_size: 0.05 },
    { symbol: 'WIPRO', name: 'Wipro Ltd', exchange: 'NSE', instrument_token: '3787777', lot_size: 1, tick_size: 0.05 }
  ];

  async initialize() {
    if (this.initialized) return;
    
    try {
      // In production, fetch from Zerodha instruments API
      // const response = await fetch('https://api.kite.trade/instruments');
      // this.instruments = await response.json();
      
      // For now, use mock data
      this.instruments = this.mockInstruments;
      this.initialized = true;
      console.log('📊 Stock search initialized with', this.instruments.length, 'instruments');
    } catch (error) {
      console.error('Failed to initialize stock search:', error);
      this.instruments = this.mockInstruments;
      this.initialized = true;
    }
  }

  async searchStocks(query: string): Promise<Stock[]> {
    await this.initialize();
    
    if (!query || query.length < 1) return [];
    
    const searchTerm = query.toLowerCase();
    return this.instruments.filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm) ||
      stock.name.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 results
  }

  async getStockBySymbol(symbol: string): Promise<Stock | null> {
    await this.initialize();
    return this.instruments.find(stock => stock.symbol === symbol.toUpperCase()) || null;
  }
}

export const stockSearchService = new StockSearchService();