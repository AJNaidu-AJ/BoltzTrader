import { rebalanceEngine } from '@/services/tradeMonitor/rebalanceEngine'

describe('Rebalance Engine Tests', () => {
  test('Rebalance triggers when exposure deviates > 5%', async () => {
    const signal = { confidence: 0.85 }
    const result = await rebalanceEngine.evaluate('BTCUSDT', 0.10, signal)
    expect(result.triggered).toBeTruthy()
    expect(result.new_size).toBeGreaterThan(0.10)
  })

  test('No rebalance when exposure within threshold', async () => {
    const signal = { confidence: 0.75 }
    const result = await rebalanceEngine.evaluate('ETHUSDT', 0.14, signal)
    expect(result.triggered).toBeFalsy()
  })

  test('Calculates correct target weight', async () => {
    const signal = { confidence: 0.9 }
    const result = await rebalanceEngine.evaluate('AAPL', 0.05, signal)
    expect(result.triggered).toBeTruthy()
    expect(result.confidence).toBe(0.9)
  })
})