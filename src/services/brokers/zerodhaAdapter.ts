import { BrokerAdapter } from './brokerService';

// Mock Zerodha adapter - replace with actual API calls
export const ZerodhaAdapter = (token: string): BrokerAdapter => ({
  async placeOrder(symbol, side, qty, price) {
    console.log(`🇮🇳 Zerodha Order: ${side.toUpperCase()} ${qty} ${symbol} @ ${price || 'MARKET'}`);
    
    // Mock API response
    return {
      order_id: `ZER_${Date.now()}`,
      status: 'COMPLETE',
      symbol,
      side,
      quantity: qty,
      price: price || 100 + Math.random() * 50
    };
  },

  async getPositions() {
    console.log('🇮🇳 Zerodha: Fetching positions');
    return [
      { symbol: 'RELIANCE', quantity: 10, average_price: 2450.50 },
      { symbol: 'TCS', quantity: 5, average_price: 3200.75 }
    ];
  },

  async getBalance() {
    console.log('🇮🇳 Zerodha: Fetching balance');
    return {
      available: 50000,
      used: 25000,
      total: 75000
    };
  },

  async cancelOrder(orderId) {
    console.log(`🇮🇳 Zerodha: Cancelling order ${orderId}`);
    return { order_id: orderId, status: 'CANCELLED' };
  }
});