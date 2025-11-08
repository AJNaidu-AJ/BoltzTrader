import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { routeTrade } from '../tradeRouter'
import { RiskGuard } from '../riskGuard'
import { ZerodhaAdapter, BinanceAdapter, AlpacaAdapter } from '../brokers'
import { AISignal } from '../brokers/types'

// Mock the audit logger
jest.mock('@/utils/auditLogger', () => ({
  logAudit: jest.fn()
}))

describe('Live Trade Execution', () => {
  const mockAISignal: AISignal = {
    symbol: 'BTCUSDT',
    status: 'BUY',
    amount: 0.01,
    confidence: 0.9,
    timestamp: new Date(),
    reasoning: 'Strong bullish pattern detected'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Trade Router', () => {
    test('should execute trade with valid AI signal', async () => {
      // Mock successful balance fetch
      const mockBalance = { data: { balance: 10000 } }
      jest.spyOn(BinanceAdapter, 'getBalance').mockResolvedValue(mockBalance)
      
      // Mock successful order placement
      const mockOrder = { id: 'order_123', status: 'filled' }
      jest.spyOn(BinanceAdapter, 'placeOrder').mockResolvedValue(mockOrder)
      
      const result = await routeTrade(mockAISignal, 'test-user')
      
      expect(result.success).toBe(true)
      expect(result.adapter).toBe('Binance')
      expect(result.order).toEqual(mockOrder)
    })

    test('should reject trade with low confidence signal', async () => {
      const lowConfidenceSignal = { ...mockAISignal, confidence: 0.5 }
      
      await expect(routeTrade(lowConfidenceSignal, 'test-user'))
        .rejects.toThrow('Signal validation failed')
    })

    test('should reject trade exceeding exposure limit', async () => {
      const highAmountSignal = { ...mockAISignal, amount: 5000 }
      const mockBalance = { data: { balance: 1000 } }
      
      jest.spyOn(BinanceAdapter, 'getBalance').mockResolvedValue(mockBalance)
      
      await expect(routeTrade(highAmountSignal, 'test-user'))
        .rejects.toThrow('Exposure limit exceeded')
    })
  })

  describe('Risk Guard', () => {
    test('should validate good AI signal', () => {
      const isValid = RiskGuard.validateSignal(mockAISignal)
      expect(isValid).toBe(true)
    })

    test('should reject invalid signal type', () => {
      const invalidSignal = { ...mockAISignal, status: 'INVALID' as any }
      const isValid = RiskGuard.validateSignal(invalidSignal)
      expect(isValid).toBe(false)
    })

    test('should check exposure limits correctly', () => {
      const balance = 10000
      const orderValue = 1500 // 15% of balance
      
      const withinLimit = RiskGuard.checkExposure(balance, orderValue)
      expect(withinLimit).toBe(true)
      
      const exceedsLimit = RiskGuard.checkExposure(balance, 3000) // 30% of balance
      expect(exceedsLimit).toBe(false)
    })
  })

  describe('Broker Adapters', () => {
    test('Zerodha adapter should format order correctly', async () => {
      const mockResponse = { data: { order_id: 'ZER123' } }
      jest.spyOn(require('axios'), 'post').mockResolvedValue(mockResponse)
      
      const result = await ZerodhaAdapter.placeOrder('RELIANCE', 'BUY', 10)
      expect(result).toEqual(mockResponse.data)
    })

    test('Binance adapter should handle crypto symbols', async () => {
      const mockResponse = { orderId: 'BIN123' }
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      })
      
      const result = await BinanceAdapter.placeOrder('BTC/USDT', 'BUY', 0.01)
      expect(result).toEqual(mockResponse)
    })

    test('Alpaca adapter should format US stock orders', async () => {
      const mockResponse = { id: 'ALP123' }
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      })
      
      const result = await AlpacaAdapter.placeOrder('AAPL', 'BUY', 10)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    test('should handle broker API failures gracefully', async () => {
      jest.spyOn(BinanceAdapter, 'getBalance').mockRejectedValue(new Error('API Error'))
      
      await expect(routeTrade(mockAISignal, 'test-user'))
        .rejects.toThrow('API Error')
    })

    test('should log failed trades for audit', async () => {
      const { logAudit } = require('@/utils/auditLogger')
      jest.spyOn(BinanceAdapter, 'placeOrder').mockRejectedValue(new Error('Order failed'))
      jest.spyOn(BinanceAdapter, 'getBalance').mockResolvedValue({ data: { balance: 10000 } })
      
      await expect(routeTrade(mockAISignal, 'test-user')).rejects.toThrow()
      expect(logAudit).toHaveBeenCalledWith(
        'trade_failed',
        mockAISignal.symbol,
        mockAISignal.status,
        'Binance',
        expect.any(Object)
      )
    })
  })
})