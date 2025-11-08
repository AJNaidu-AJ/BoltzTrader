import { monitorPortfolio } from '@/services/tradeMonitor/monitorService'
import { generateVolatilitySeries } from './utils/generateVolatilitySeries'
import { mockSupabase } from './utils/mockSupabase'

jest.mock('@/lib/supabaseClient', () => ({ supabase: mockSupabase }))

describe('Stress & Load Tests', () => {
  beforeEach(() => {
    mockSupabase.clear()
  })

  test('Monitor handles 1000 positions under 2 seconds', async () => {
    const portfolio = { user_id: 'stress-test', holdings: generateVolatilitySeries(1000) }
    const start = Date.now()
    await monitorPortfolio(portfolio.user_id, portfolio)
    const end = Date.now()
    expect(end - start).toBeLessThan(2000)
  })

  test('Processes large portfolio without errors', async () => {
    const portfolio = { user_id: 'load-test', holdings: generateVolatilitySeries(500) }
    await expect(monitorPortfolio(portfolio.user_id, portfolio)).resolves.not.toThrow()
  })

  test('Memory usage remains stable during stress test', async () => {
    const initialMemory = process.memoryUsage().heapUsed
    const portfolio = { user_id: 'memory-test', holdings: generateVolatilitySeries(100) }
    
    for (let i = 0; i < 10; i++) {
      await monitorPortfolio(portfolio.user_id, portfolio)
    }
    
    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB
    expect(memoryIncrease).toBeLessThan(50) // Less than 50MB increase
  })
})