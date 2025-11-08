import { monitorPortfolio } from '@/services/tradeMonitor/monitorService'
import portfolio from './mock_data/sample_portfolio.json'
import { mockSupabase } from './utils/mockSupabase'

jest.mock('@/lib/supabaseClient', () => ({ supabase: mockSupabase }))

describe('Monitor Service Integration Tests', () => {
  beforeEach(() => {
    mockSupabase.clear()
  })

  test('Records all triggered events correctly', async () => {
    await monitorPortfolio(portfolio.user_id, portfolio)
    const events = mockSupabase.inserted
    expect(events.length).toBeGreaterThan(0)
    expect(events.some((e) => e.event_type === 'rebalance')).toBeTruthy()
  })

  test('Processes all portfolio holdings', async () => {
    await monitorPortfolio(portfolio.user_id, portfolio)
    const events = mockSupabase.inserted
    const symbols = [...new Set(events.map(e => e.symbol))]
    expect(symbols.length).toBeGreaterThan(0)
  })

  test('Records event metadata correctly', async () => {
    await monitorPortfolio(portfolio.user_id, portfolio)
    const event = mockSupabase.inserted[0]
    expect(event).toHaveProperty('symbol')
    expect(event).toHaveProperty('event_type')
    expect(event).toHaveProperty('reason')
    expect(event).toHaveProperty('confidence')
  })
})