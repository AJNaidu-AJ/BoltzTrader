import { AISignal, TradeOrder } from '../brokers/types'

export class OrderValidator {
  static validateSymbol(symbol: string, broker: string): boolean {
    const symbolPatterns = {
      'Zerodha': /^[A-Z0-9&-]+$/, // Indian stock symbols
      'Binance': /^[A-Z0-9]+\/[A-Z0-9]+$|^[A-Z0-9]+$/, // Crypto pairs
      'Alpaca': /^[A-Z]{1,5}$/ // US stock symbols
    }
    
    const pattern = symbolPatterns[broker as keyof typeof symbolPatterns]
    return pattern ? pattern.test(symbol) : true
  }

  static validateQuantity(qty: number, broker: string): boolean {
    const minQuantities = {
      'Zerodha': 1, // Minimum 1 share
      'Binance': 0.00001, // Minimum crypto amount
      'Alpaca': 1 // Minimum 1 share
    }
    
    const minQty = minQuantities[broker as keyof typeof minQuantities] || 1
    return qty >= minQty && qty <= 1000000 // Max reasonable quantity
  }

  static validatePrice(price: number | undefined, orderType: 'MARKET' | 'LIMIT'): boolean {
    if (orderType === 'MARKET') {
      return price === undefined
    }
    
    if (orderType === 'LIMIT') {
      return price !== undefined && price > 0 && price <= 1000000
    }
    
    return true
  }

  static validateAISignal(signal: AISignal): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!signal.symbol || signal.symbol.trim() === '') {
      errors.push('Symbol is required')
    }
    
    if (!['BUY', 'SELL'].includes(signal.status)) {
      errors.push('Status must be BUY or SELL')
    }
    
    if (!signal.amount || signal.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }
    
    if (signal.confidence < 0 || signal.confidence > 1) {
      errors.push('Confidence must be between 0 and 1')
    }
    
    if (!signal.timestamp || isNaN(signal.timestamp.getTime())) {
      errors.push('Valid timestamp is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  static validateTradeOrder(order: Partial<TradeOrder>, broker: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!order.symbol || !this.validateSymbol(order.symbol, broker)) {
      errors.push(`Invalid symbol format for ${broker}`)
    }
    
    if (!order.side || !['BUY', 'SELL'].includes(order.side)) {
      errors.push('Side must be BUY or SELL')
    }
    
    if (!order.qty || !this.validateQuantity(order.qty, broker)) {
      errors.push(`Invalid quantity for ${broker}`)
    }
    
    const orderType = order.price ? 'LIMIT' : 'MARKET'
    if (!this.validatePrice(order.price, orderType)) {
      errors.push('Invalid price for order type')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  static sanitizeSymbol(symbol: string, broker: string): string {
    switch (broker) {
      case 'Zerodha':
        return symbol.toUpperCase().replace(/[^A-Z0-9&-]/g, '')
      case 'Binance':
        return symbol.toUpperCase().replace('/', '')
      case 'Alpaca':
        return symbol.toUpperCase().replace(/[^A-Z]/g, '')
      default:
        return symbol.toUpperCase()
    }
  }

  static formatQuantity(qty: number, broker: string): number {
    switch (broker) {
      case 'Zerodha':
      case 'Alpaca':
        return Math.floor(qty) // Whole shares only
      case 'Binance':
        return Math.round(qty * 100000) / 100000 // 5 decimal places for crypto
      default:
        return qty
    }
  }
}