export const rebalanceEngine = {
  async evaluate(symbol: string, exposure: number, aiSignal: any) {
    const targetWeight = aiSignal.confidence * 0.2
    const diff = targetWeight - exposure
    if (Math.abs(diff) > 0.05) {
      return {
        triggered: true,
        new_size: exposure + diff,
        reason: 'Exposure deviation',
        confidence: aiSignal.confidence,
        ai_signal: aiSignal
      }
    }
    return { triggered: false }
  }
}