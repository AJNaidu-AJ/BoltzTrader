export function generateVolatilitySeries(count = 1000) {
  return Array.from({ length: count }, (_, i) => ({
    symbol: 'BTCUSDT',
    size: Math.random() * 10,
    pnl: (Math.random() - 0.5) * 0.1,
    exposure: Math.random() * 0.3,
    volatility: Math.random() * 0.15,
    ai_signal: { confidence: Math.random() },
    trade_id: `trade-${i}`
  }))
}