import { v4 as uuidv4 } from 'uuid';

export class PaperTradeClient {
  constructor() {
    this.portfolio = new Map(); // In-memory portfolio for paper trading
  }

  async placeOrder({ symbol, side, quantity, orderType, price }) {
    try {
      const orderId = `PAPER${Date.now()}`;
      
      // Simulate realistic order processing delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get current market price (mock)
      const marketPrice = this.getMockPrice(symbol);
      const fillPrice = price && orderType === 'limit' ? price : marketPrice;
      
      // Simulate order fill logic
      const shouldFill = this.shouldOrderFill(orderType, side, fillPrice, marketPrice);
      
      if (shouldFill) {
        // Update paper portfolio
        this.updatePortfolio(symbol, side, quantity, fillPrice);
        
        return {
          orderId,
          status: 'filled',
          filledQuantity: quantity,
          filledPrice: fillPrice,
          metadata: {
            broker: 'paper',
            portfolio_value: this.getPortfolioValue(),
            position: this.getPosition(symbol)
          }
        };
      } else {
        return {
          orderId,
          status: 'pending',
          filledQuantity: 0,
          filledPrice: null,
          metadata: {
            broker: 'paper',
            reason: 'Limit price not reached'
          }
        };
      }
      
    } catch (error) {
      console.error('Paper trade error:', error);
      return {
        orderId: null,
        status: 'rejected',
        error: error.message
      };
    }
  }

  shouldOrderFill(orderType, side, limitPrice, marketPrice) {
    if (orderType === 'market') return true;
    
    if (orderType === 'limit') {
      if (side === 'buy') return marketPrice <= limitPrice;
      if (side === 'sell') return marketPrice >= limitPrice;
    }
    
    return false;
  }

  updatePortfolio(symbol, side, quantity, price) {
    const position = this.portfolio.get(symbol) || { quantity: 0, avgPrice: 0 };
    
    if (side === 'buy') {
      const totalValue = (position.quantity * position.avgPrice) + (quantity * price);
      const totalQuantity = position.quantity + quantity;
      
      position.quantity = totalQuantity;
      position.avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
    } else if (side === 'sell') {
      position.quantity = Math.max(0, position.quantity - quantity);
    }
    
    this.portfolio.set(symbol, position);
  }

  getPosition(symbol) {
    return this.portfolio.get(symbol) || { quantity: 0, avgPrice: 0 };
  }

  getPortfolioValue() {
    let totalValue = 0;
    
    for (const [symbol, position] of this.portfolio) {
      const currentPrice = this.getMockPrice(symbol);
      totalValue += position.quantity * currentPrice;
    }
    
    return totalValue;
  }

  getMockPrice(symbol) {
    // Generate realistic mock prices with some volatility
    const basePrices = {
      'AAPL': 180,
      'MSFT': 380,
      'GOOGL': 140,
      'TSLA': 250,
      'NVDA': 480,
      'AMZN': 150,
      'RELIANCE': 2500,
      'TCS': 3800,
      'INFY': 1600,
      'HDFCBANK': 1700,
      'ICICIBANK': 950
    };
    
    const basePrice = basePrices[symbol] || 100;
    const volatility = 0.02; // 2% volatility
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
    
    return Math.round(basePrice * randomFactor * 100) / 100;
  }
}