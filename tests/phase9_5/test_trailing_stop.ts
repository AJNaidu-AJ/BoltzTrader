import { trailingStop } from '@/services/tradeMonitor/trailingStop'

describe('Trailing Stop Tests', () => {
  test('Triggers stop loss when P&L < -3%', () => {
    const result = trailingStop('AAPL', -0.04)
    expect(result.triggered).toBe(true)
    expect(result.new_size).toBe(0)
    expect(result.reason).toBe('Trailing stop loss triggered')
  })

  test('No trigger for positive P&L', () => {
    const result = trailingStop('BTCUSDT', 0.02)
    expect(result.triggered).toBe(false)
  })

  test('No trigger for small losses', () => {
    const result = trailingStop('ETHUSDT', -0.01)
    expect(result.triggered).toBe(false)
  })

  test('High confidence on stop trigger', () => {
    const result = trailingStop('TSLA', -0.05)
    expect(result.confidence).toBe(0.95)
  })
})