import { ZerodhaAdapter } from '../zerodhaAdapter';

describe('Zerodha Adapter Tests', () => {
  const mockToken = 'test_zerodha_token';
  const adapter = ZerodhaAdapter(mockToken);

  test('should place buy order', async () => {
    const result = await adapter.placeOrder('RELIANCE', 'buy', 10, 2500);
    
    expect(result).toHaveProperty('order_id');
    expect(result.symbol).toBe('RELIANCE');
    expect(result.side).toBe('buy');
    expect(result.quantity).toBe(10);
  });

  test('should place sell order', async () => {
    const result = await adapter.placeOrder('TCS', 'sell', 5);
    
    expect(result).toHaveProperty('order_id');
    expect(result.symbol).toBe('TCS');
    expect(result.side).toBe('sell');
    expect(result.quantity).toBe(5);
  });

  test('should get positions', async () => {
    const positions = await adapter.getPositions();
    
    expect(Array.isArray(positions)).toBe(true);
    expect(positions.length).toBeGreaterThan(0);
    expect(positions[0]).toHaveProperty('symbol');
  });

  test('should get balance', async () => {
    const balance = await adapter.getBalance();
    
    expect(balance).toHaveProperty('available');
    expect(balance).toHaveProperty('total');
    expect(typeof balance.available).toBe('number');
  });

  test('should cancel order', async () => {
    const result = await adapter.cancelOrder('ZER_123456');
    
    expect(result).toHaveProperty('order_id');
    expect(result.status).toBe('CANCELLED');
  });
});

// Mock test runner
console.log('🧪 Running Zerodha Adapter Tests...');
const adapter = ZerodhaAdapter('test_token');

adapter.placeOrder('RELIANCE', 'buy', 10, 2500)
  .then(result => console.log('✅ Buy order test passed:', result))
  .catch(error => console.error('❌ Buy order test failed:', error));

adapter.getPositions()
  .then(positions => console.log('✅ Positions test passed:', positions))
  .catch(error => console.error('❌ Positions test failed:', error));