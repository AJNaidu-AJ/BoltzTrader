import { BrokerAdapter } from './brokerService';

// Mock Binance adapter - replace with actual API calls
export const BinanceAdapter = (apiKey: string, apiSecret: string): BrokerAdapter => ({
  async placeOrder(symbol, side, qty, price) {
    console.log(`🌍 Binance Order: ${side.toUpperCase()} ${qty} ${symbol} @ ${price || 'MARKET'}`);
    
    // Mock API response
    return {
      orderId: `BIN_${Date.now()}`,
      status: 'FILLED',
      symbol,
      side: side.toUpperCase(),
      origQty: qty,
      price: price || 50000 + Math.random() * 10000
    };
  },

  async getPositions() {
    console.log('🌍 Binance: Fetching positions');
    return [
      { asset: 'BTC', free: '0.5', locked: '0.1' },
      { asset: 'ETH', free: '2.3', locked: '0.5' }
    ];
  },

  async getBalance() {
    console.log('🌍 Binance: Fetching balance');
    return {
      totalWalletBalance: '10000.50',
      availableBalance: '8500.25'
    };
  },

  async cancelOrder(orderId) {
    console.log(`🌍 Binance: Cancelling order ${orderId}`);
    return { orderId, status: 'CANCELED' };
  }
});