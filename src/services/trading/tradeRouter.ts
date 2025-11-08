import { ZerodhaAdapter, BinanceAdapter, AlpacaAdapter, BrokerAdapter, AISignal } from './brokers'
import { RiskGuard } from './riskGuard'
import { logAudit } from '@/utils/auditLogger'

// Mock region detection - replace with actual implementation
function getUserRegion(): string {
  // In production, get from user profile or IP geolocation
  return 'US' // Default to US for demo
}

export async function routeTrade(aiSignal: AISignal, userId: string = 'demo-user') {
  const region = getUserRegion()
  
  // Select broker based on user region
  const adapter: BrokerAdapter = 
    region === 'IN' ? ZerodhaAdapter :
    region === 'US' ? AlpacaAdapter : 
    BinanceAdapter

  try {
    // Get current balance
    const balanceRes = await adapter.getBalance()
    const balance = extractBalance(balanceRes, adapter.name)
    
    // Enforce risk management rules
    await RiskGuard.enforce(aiSignal, balance, userId)
    
    // Execute the trade
    const order = await adapter.placeOrder(
      aiSignal.symbol, 
      aiSignal.status, 
      aiSignal.amount
    )
    
    // Log successful execution
    await logAudit('trade_executed', aiSignal.symbol, aiSignal.status, adapter.name, {
      orderId: order.id || order.order_id,
      amount: aiSignal.amount,
      confidence: aiSignal.confidence,
      userId
    })
    
    return { 
      success: true,
      adapter: adapter.name, 
      order,
      signal: aiSignal
    }
    
  } catch (error) {
    // Log failed execution
    await logAudit('trade_failed', aiSignal.symbol, aiSignal.status, adapter.name, {
      error: error.message,
      userId,
      signal: aiSignal
    })
    
    throw error
  }
}

// Extract balance from different broker response formats
function extractBalance(balanceRes: any, brokerName: string): number {
  switch (brokerName) {
    case 'Zerodha':
      return balanceRes.data?.equity?.available?.cash || 10000
    case 'Binance':
      return parseFloat(balanceRes.balances?.find(b => b.asset === 'USDT')?.free || '1000')
    case 'Alpaca':
      return parseFloat(balanceRes.buying_power || '10000')
    default:
      return 10000 // Default demo balance
  }
}

export async function cancelTrade(orderId: string, brokerName: string) {
  const adapter = 
    brokerName === 'Zerodha' ? ZerodhaAdapter :
    brokerName === 'Binance' ? BinanceAdapter :
    AlpacaAdapter

  try {
    const result = await adapter.cancelOrder(orderId)
    await logAudit('trade_cancelled', orderId, 'CANCEL', brokerName, result)
    return result
  } catch (error) {
    await logAudit('cancel_failed', orderId, 'CANCEL', brokerName, { error: error.message })
    throw error
  }
}