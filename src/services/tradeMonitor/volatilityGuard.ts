export function volatilityGuard(symbol: string, vol: number) {
  if (vol > 0.07) {
    return {
      adjust: true,
      new_size: 0.8,
      reason: 'High volatility detected',
      confidence: 0.9
    }
  }
  return { adjust: false }
}