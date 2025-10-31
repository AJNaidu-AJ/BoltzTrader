import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class AlpacaClient {
  constructor() {
    this.apiKey = process.env.ALPACA_API_KEY;
    this.secretKey = process.env.ALPACA_SECRET_KEY;
    this.baseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
  }

  async placeOrder({ symbol, side, quantity, orderType, price }) {
    try {
      const orderData = {
        symbol,
        qty: quantity,
        side,
        type: orderType,
        time_in_force: 'day'
      };

      if (orderType === 'limit' && price) {
        orderData.limit_price = price;
      }

      // Mock Alpaca API call
      const orderId = `ALP${Date.now()}`;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock successful order placement
      const mockPrice = price || this.getMockPrice(symbol);
      
      return {
        orderId,
        status: 'filled',
        filledQuantity: quantity,
        filledPrice: mockPrice,
        metadata: {
          broker: 'alpaca',
          exchange: 'NASDAQ',
          order_class: 'simple'
        }
      };
      
    } catch (error) {
      console.error('Alpaca order error:', error);
      return {
        orderId: null,
        status: 'rejected',
        error: error.message
      };
    }
  }

  getMockPrice(symbol) {
    // Mock US stock prices
    const basePrices = {
      'AAPL': 180,
      'MSFT': 380,
      'GOOGL': 140,
      'TSLA': 250,
      'NVDA': 480,
      'AMZN': 150
    };
    
    const basePrice = basePrices[symbol] || 100;
    return basePrice + (Math.random() - 0.5) * 10;
  }
}