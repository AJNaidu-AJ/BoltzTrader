import { executeTrade } from '../brokers/tradeRouter';
import { validateTrade } from '../riskGuard';
import { BrokerCredentials, TradeSignal } from '../brokers/brokerService';

export async function processSignal(
  userId: string, 
  broker: string, 
  credentials: BrokerCredentials, 
  signal: TradeSignal
) {
  try {
    console.log(`🤖 Processing AI signal for ${signal.symbol}`);
    
    // Validate trade against risk parameters
    validateTrade(signal, signal.balance);
    
    // Execute trade through broker
    const result = await executeTrade(broker, credentials, signal);
    
    console.log(`✅ Trade executed successfully on ${broker}:`, {
      symbol: signal.symbol,
      side: signal.side,
      quantity: signal.qty,
      orderId: result.order_id || result.orderId || result.id
    });
    
    return {
      success: true,
      orderId: result.order_id || result.orderId || result.id,
      broker,
      signal
    };
    
  } catch (error) {
    console.error('❌ Signal processing failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      broker,
      signal
    };
  }
}

export async function generateMockSignal(): Promise<TradeSignal> {
  const symbols = ['AAPL', 'TSLA', 'RELIANCE', 'TCS', 'BTCUSDT', 'ETHUSDT'];
  const sides = ['buy', 'sell'] as const;
  
  return {
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    side: sides[Math.floor(Math.random() * sides.length)],
    qty: Math.floor(Math.random() * 10) + 1,
    price: 100 + Math.random() * 200,
    confidence: 0.7 + Math.random() * 0.3, // 70-100%
    amount: 1000 + Math.random() * 5000,
    balance: 50000
  };
}