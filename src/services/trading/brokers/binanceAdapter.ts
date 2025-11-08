import { BrokerAdapter } from './types'
import { logAudit } from '@/utils/auditLogger'

export const BinanceAdapter: BrokerAdapter = {
  name: 'Binance',
  
  async placeOrder(symbol: string, side: 'BUY'|'SELL', qty: number, price?: number) {
    try {
      const orderData = {
        symbol: symbol.replace('/', ''),
        side,
        type: price ? 'LIMIT' : 'MARKET',
        quantity: qty,
        ...(price && { price, timeInForce: 'GTC' })
      }
      
      const res = await fetch('/api/binance/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      const data = await res.json()
      await logAudit('trade_order', symbol, side, 'Binance', data)
      return data
    } catch (error) {
      await logAudit('trade_error', symbol, side, 'Binance', { error: error.message })
      throw error
    }
  },

  async cancelOrder(orderId: string) {
    try {
      const res = await fetch(`/api/binance/order/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.json()
      await logAudit('order_cancelled', orderId, 'CANCEL', 'Binance', data)
      return data
    } catch (error) {
      await logAudit('cancel_error', orderId, 'CANCEL', 'Binance', { error: error.message })
      throw error
    }
  },

  async getBalance() {
    try {
      const res = await fetch('/api/binance/account')
      return await res.json()
    } catch (error) {
      console.error('Binance balance fetch error:', error)
      throw error
    }
  },

  async getPositions() {
    try {
      const res = await fetch('/api/binance/positions')
      return await res.json()
    } catch (error) {
      console.error('Binance positions fetch error:', error)
      throw error
    }
  }
}