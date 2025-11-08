import { logAudit } from '@/utils/auditLogger'
import { AISignal } from './brokers/types'

export const RiskGuard = {
  // Maximum exposure per trade (20% of balance)
  MAX_EXPOSURE_RATIO: 0.2,
  
  // Minimum confidence threshold for AI signals
  MIN_CONFIDENCE: 0.7,
  
  // Maximum daily trades per symbol
  MAX_DAILY_TRADES: 10,

  checkExposure: (balance: number, orderValue: number): boolean => {
    return orderValue <= balance * RiskGuard.MAX_EXPOSURE_RATIO
  },

  validateSignal: (signal: AISignal): boolean => {
    return ['BUY', 'SELL'].includes(signal.status) && 
           signal.confidence >= RiskGuard.MIN_CONFIDENCE &&
           signal.amount > 0
  },

  checkDailyLimit: async (symbol: string, userId: string): Promise<boolean> => {
    // Mock implementation - in production, query database for daily trade count
    const dailyTrades = await getDailyTradeCount(symbol, userId)
    return dailyTrades < RiskGuard.MAX_DAILY_TRADES
  },

  enforce: async (signal: AISignal, balance: number, userId: string): Promise<void> => {
    const validSignal = RiskGuard.validateSignal(signal)
    const validExposure = RiskGuard.checkExposure(balance, signal.amount)
    const withinDailyLimit = await RiskGuard.checkDailyLimit(signal.symbol, userId)

    if (!validSignal) {
      await logAudit('trade_blocked', signal.symbol, 'INVALID_SIGNAL', 'RiskGuard', {
        reason: 'Invalid signal or low confidence',
        confidence: signal.confidence,
        minRequired: RiskGuard.MIN_CONFIDENCE
      })
      throw new Error(`Signal validation failed: confidence ${signal.confidence} below threshold ${RiskGuard.MIN_CONFIDENCE}`)
    }

    if (!validExposure) {
      await logAudit('trade_blocked', signal.symbol, 'EXPOSURE_LIMIT', 'RiskGuard', {
        reason: 'Exposure limit exceeded',
        orderValue: signal.amount,
        maxAllowed: balance * RiskGuard.MAX_EXPOSURE_RATIO
      })
      throw new Error(`Exposure limit exceeded: ${signal.amount} > ${balance * RiskGuard.MAX_EXPOSURE_RATIO}`)
    }

    if (!withinDailyLimit) {
      await logAudit('trade_blocked', signal.symbol, 'DAILY_LIMIT', 'RiskGuard', {
        reason: 'Daily trade limit exceeded',
        symbol: signal.symbol,
        maxTrades: RiskGuard.MAX_DAILY_TRADES
      })
      throw new Error(`Daily trade limit exceeded for ${signal.symbol}`)
    }
  }
}

// Mock function - replace with actual database query
async function getDailyTradeCount(symbol: string, userId: string): Promise<number> {
  // In production, query trade_orders table for today's trades
  return Math.floor(Math.random() * 5) // Mock: 0-4 trades
}