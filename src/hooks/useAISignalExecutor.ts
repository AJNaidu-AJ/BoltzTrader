import { useState } from 'react'
import { routeTrade, cancelTrade } from '@/services/trading/tradeRouter'
import { logAudit } from '@/utils/auditLogger'
import { AISignal } from '@/services/trading/brokers/types'

export const useAISignalExecutor = () => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionHistory, setExecutionHistory] = useState<any[]>([])

  async function executeAISignal(signal: AISignal, userId?: string) {
    setIsExecuting(true)
    
    try {
      // Log signal received
      await logAudit('ai_signal_received', signal.symbol, signal.status, 'AIEngine', {
        confidence: signal.confidence,
        reasoning: signal.reasoning,
        timestamp: signal.timestamp
      })
      
      // Execute trade through router
      const result = await routeTrade(signal, userId)
      
      // Update execution history
      setExecutionHistory(prev => [...prev, {
        ...result,
        timestamp: new Date(),
        status: 'executed'
      }])
      
      // Log successful AI trade
      await logAudit('ai_trade', signal.symbol, 'EXECUTED', result.adapter, {
        orderId: result.order.id || result.order.order_id,
        confidence: signal.confidence,
        userId
      })
      
      return result
      
    } catch (error) {
      console.error('AI Trade Execution Failed:', error)
      
      // Update execution history with failure
      setExecutionHistory(prev => [...prev, {
        signal,
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      }])
      
      // Log failed AI trade
      await logAudit('ai_trade', signal.symbol, 'FAILED', 'System', { 
        error: error.message,
        confidence: signal.confidence,
        userId
      })
      
      throw error
    } finally {
      setIsExecuting(false)
    }
  }

  async function cancelAITrade(orderId: string, brokerName: string) {
    try {
      const result = await cancelTrade(orderId, brokerName)
      
      // Update execution history
      setExecutionHistory(prev => prev.map(trade => 
        trade.order?.id === orderId || trade.order?.order_id === orderId
          ? { ...trade, status: 'cancelled', cancelledAt: new Date() }
          : trade
      ))
      
      return result
    } catch (error) {
      console.error('AI Trade Cancellation Failed:', error)
      throw error
    }
  }

  function getExecutionStats() {
    const total = executionHistory.length
    const executed = executionHistory.filter(t => t.status === 'executed').length
    const failed = executionHistory.filter(t => t.status === 'failed').length
    const cancelled = executionHistory.filter(t => t.status === 'cancelled').length
    
    return {
      total,
      executed,
      failed,
      cancelled,
      successRate: total > 0 ? (executed / total) * 100 : 0
    }
  }

  return { 
    executeAISignal,
    cancelAITrade,
    isExecuting,
    executionHistory,
    getExecutionStats
  }
}