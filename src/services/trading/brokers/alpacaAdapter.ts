import { BrokerAdapter } from './types'
import { logAudit } from '@/utils/auditLogger'

export const AlpacaAdapter: BrokerAdapter = {
  name: 'Alpaca',
  
  async placeOrder(symbol: string, side: 'BUY'|'SELL', qty: number, price?: number) {
    try {
      const orderData = {
        symbol,
        qty,
        side: side.toLowerCase(),
        type: price ? 'limit' : 'market',
        time_in_force: 'day',
        ...(price && { limit_price: price })
      }
      
      const res = await fetch('/api/alpaca/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      const data = await res.json()
      await logAudit('trade_order', symbol, side, 'Alpaca', data)
      return data
    } catch (error) {
      await logAudit('trade_error', symbol, side, 'Alpaca', { error: error.message })
      throw error
    }
  },

  async cancelOrder(orderId: string) {
    try {
      const res = await fetch(`/api/alpaca/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.json()
      await logAudit('order_cancelled', orderId, 'CANCEL', 'Alpaca', data)
      return data
    } catch (error) {
      await logAudit('cancel_error', orderId, 'CANCEL', 'Alpaca', { error: error.message })
      throw error
    }
  },

  async getBalance() {
    try {
      const res = await fetch('/api/alpaca/account')
      return await res.json()
    } catch (error) {
      console.error('Alpaca balance fetch error:', error)
      throw error
    }
  },

  async getPositions() {
    try {
      const res = await fetch('/api/alpaca/positions')
      return await res.json()
    } catch (error) {
      console.error('Alpaca positions fetch error:', error)
      throw error
    }
  }
}