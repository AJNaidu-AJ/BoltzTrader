export function trailingStop(symbol: string, pnl: number) {
  const threshold = -0.03
  if (pnl < threshold) {
    return {
      triggered: true,
      new_size: 0,
      reason: 'Trailing stop loss triggered',
      confidence: 0.95
    }
  }
  return { triggered: false }
}