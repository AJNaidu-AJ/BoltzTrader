import { BrokerAdapter } from './brokerService';

// Mock Alpaca adapter - replace with actual API calls
export const AlpacaAdapter = (apiKey: string, apiSecret: string): BrokerAdapter => ({
  async placeOrder(symbol, side, qty, price) {
    console.log(`🇺🇸 Alpaca Order: ${side.toUpperCase()} ${qty} ${symbol} @ ${price || 'MARKET'}`);
    
    // Mock API response
    return {
      id: `ALP_${Date.now()}`,
      status: 'filled',
      symbol,
      side,
      qty,
      filled_avg_price: price || 150 + Math.random() * 50
    };
  },

  async getPositions() {
    console.log('🇺🇸 Alpaca: Fetching positions');
    return [
      { symbol: 'AAPL', qty: '10', avg_entry_price: '175.50' },
      { symbol: 'TSLA', qty: '5', avg_entry_price: '250.25' }
    ];
  },

  async getBalance() {
    console.log('🇺🇸 Alpaca: Fetching balance');
    return {
      cash: '25000.00',
      buying_power: '50000.00',
      portfolio_value: '75000.00'
    };
  },

  async cancelOrder(orderId) {
    console.log(`🇺🇸 Alpaca: Cancelling order ${orderId}`);
    return { id: orderId, status: 'canceled' };
  }
});