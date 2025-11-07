import { policyEngine } from './policyEngine'
import { logAudit } from '@/utils/auditLogger'
import { storeXAI } from './xaiService'

export interface Trade {
  id: string
  strategy_id: string
  symbol: string
  amount: number
  type: 'BUY' | 'SELL'
  price: number
  user_id: string
}

export interface User {
  id: string
  email: string
  region: string
  kyc_verified: boolean
  two_factor_enabled: boolean
}

export const tradeService = {
  async executeTrade(trade: Trade, user: User, gptReasoning: string, confidence: number): Promise<boolean> {
    try {
      // Step 1: Enforce compliance policy
      await policyEngine.enforcePolicy(user.region, user)
      
      // Step 2: Validate trade volume
      await policyEngine.validateTradeVolume(user.region, trade.amount)
      
      // Step 3: Execute trade logic (placeholder)
      const tradeResult = await this.processTradeExecution(trade)
      
      // Step 4: Log audit trail
      await logAudit('trade', trade.id, 'EXECUTE', user.email, {
        symbol: trade.symbol,
        amount: trade.amount,
        type: trade.type,
        price: trade.price
      })
      
      // Step 5: Store XAI reasoning
      await storeXAI(trade.strategy_id, trade, gptReasoning, confidence)
      
      return tradeResult
    } catch (error) {
      // Log failed trade attempt
      await logAudit('trade', trade.id, 'FAILED', user.email, {
        error: error.message,
        trade
      })
      throw error
    }
  },

  async processTradeExecution(trade: Trade): Promise<boolean> {
    // Placeholder for actual trade execution logic
    console.log(`Executing trade: ${trade.type} ${trade.amount} ${trade.symbol} at ${trade.price}`)
    
    // Simulate trade processing
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  },

  async validateTradeCompliance(trade: Trade, user: User): Promise<{ valid: boolean; violations: string[] }> {
    const violations: string[] = []
    
    try {
      await policyEngine.enforcePolicy(user.region, user)
      await policyEngine.validateTradeVolume(user.region, trade.amount)
    } catch (error) {
      violations.push(error.message)
    }
    
    return {
      valid: violations.length === 0,
      violations
    }
  }
}