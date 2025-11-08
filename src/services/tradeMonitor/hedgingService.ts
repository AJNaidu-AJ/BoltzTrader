export async function hedgePosition(symbol: string, direction: 'LONG' | 'SHORT', size: number) {
  const hedgeSymbol = symbol.includes('BTC') ? 'ETH' : 'INDEX'
  return {
    action: 'hedge',
    hedge_symbol: hedgeSymbol,
    size,
    reason: 'Correlated hedge for risk offset',
    confidence: 0.8
  }
}