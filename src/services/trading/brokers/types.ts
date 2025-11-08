export interface BrokerAdapter {
  placeOrder: (symbol: string, side: 'BUY'|'SELL', qty: number, price?: number) => Promise<any>
  cancelOrder: (orderId: string) => Promise<any>
  getBalance: () => Promise<any>
  getPositions: () => Promise<any>
  name: string
}

export interface TradeOrder {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  qty: number
  price?: number
  status: 'pending' | 'executed' | 'cancelled' | 'failed'
  broker: string
  timestamp: Date
}

export interface AISignal {
  symbol: string
  status: 'BUY' | 'SELL'
  amount: number
  confidence: number
  timestamp: Date
  reasoning?: string
}