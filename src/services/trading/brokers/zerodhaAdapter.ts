import { BrokerAdapter } from './types'
import axios from 'axios'
import { logAudit } from '@/utils/auditLogger'

export const ZerodhaAdapter: BrokerAdapter = {
  name: 'Zerodha',
  
  async placeOrder(symbol: string, side: 'BUY'|'SELL', qty: number, price?: number) {
    try {
      const orderData = {
        tradingsymbol: symbol,
        exchange: 'NSE',
        transaction_type: side,
        quantity: qty,
        order_type: price ? 'LIMIT' : 'MARKET',
        product: 'MIS',
        ...(price && { price })
      }
      
      const res = await axios.post('/api/zerodha/order', orderData, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      await logAudit('trade_order', symbol, side, 'Zerodha', res.data)
      return res.data
    } catch (error) {
      await logAudit('trade_error', symbol, side, 'Zerodha', { error: error.message })
      throw error
    }
  },

  async cancelOrder(orderId: string) {
    try {
      const res = await axios.delete(`/api/zerodha/order/${orderId}`)
      await logAudit('order_cancelled', orderId, 'CANCEL', 'Zerodha', res.data)
      return res.data
    } catch (error) {
      await logAudit('cancel_error', orderId, 'CANCEL', 'Zerodha', { error: error.message })
      throw error
    }
  },

  async getBalance() {
    try {
      const res = await axios.get('/api/zerodha/margins')
      return res.data
    } catch (error) {
      console.error('Zerodha balance fetch error:', error)
      throw error
    }
  },

  async getPositions() {
    try {
      const res = await axios.get('/api/zerodha/positions')
      return res.data
    } catch (error) {
      console.error('Zerodha positions fetch error:', error)
      throw error
    }
  }
}