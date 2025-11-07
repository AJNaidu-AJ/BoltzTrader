import { ZerodhaAdapter } from './zerodhaAdapter';
import { BinanceAdapter } from './binanceAdapter';
import { AlpacaAdapter } from './alpacaAdapter';
import { BrokerCredentials, TradeSignal } from './brokerService';
import { logAudit } from '@/utils/auditLogger';

export async function executeTrade(
  broker: string, 
  credentials: BrokerCredentials, 
  signal: TradeSignal
) {
  let adapter;

  switch (broker.toUpperCase()) {
    case 'ZERODHA': 
      adapter = ZerodhaAdapter(credentials.access_token!); 
      break;
    case 'BINANCE': 
      adapter = BinanceAdapter(credentials.api_key, credentials.api_secret); 
      break;
    case 'ALPACA': 
      adapter = AlpacaAdapter(credentials.api_key, credentials.api_secret); 
      break;
    default: 
      throw new Error(`Unsupported broker: ${broker}`);
  }

  const { symbol, side, qty, price } = signal;
  
  try {
    const result = await adapter.placeOrder(symbol, side, qty, price);
    
    // Log audit trail
    await logAudit(
      'trade', 
      result.order_id || result.orderId || result.id, 
      'EXECUTE', 
      credentials.user_id, 
      { broker, symbol, side, qty, price, confidence: signal.confidence }
    );

    console.log(`✅ Trade executed on ${broker}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Trade failed on ${broker}:`, error);
    
    // Log failed trade attempt
    await logAudit(
      'trade', 
      `failed_${Date.now()}`, 
      'FAILED', 
      credentials.user_id, 
      { broker, symbol, side, qty, price, error: error.message }
    );
    
    throw error;
  }
}