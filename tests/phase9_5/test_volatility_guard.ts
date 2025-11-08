import { volatilityGuard } from '@/services/tradeMonitor/volatilityGuard'

describe('Volatility Guard Tests', () => {
  test('Triggers on high volatility (> 7%)', () => {
    const action = volatilityGuard('ETHUSDT', 0.09)
    expect(action.adjust).toBeTruthy()
    expect(action.new_size).toBe(0.8)
    expect(action.reason).toBe('High volatility detected')
  })

  test('No adjustment for normal volatility', () => {
    const action = volatilityGuard('BTCUSDT', 0.05)
    expect(action.adjust).toBeFalsy()
  })

  test('High confidence on volatility trigger', () => {
    const action = volatilityGuard('AAPL', 0.12)
    expect(action.confidence).toBe(0.9)
  })
})