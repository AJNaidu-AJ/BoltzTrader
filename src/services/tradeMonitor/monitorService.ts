import { rebalanceEngine } from './rebalanceEngine'
import { volatilityGuard } from './volatilityGuard'
import { trailingStop } from './trailingStop'
import { supabase } from '@/lib/supabaseClient'

export async function monitorPortfolio(userId: string, portfolio: any) {
  for (const position of portfolio.holdings) {
    const { symbol, pnl, exposure, volatility, ai_signal } = position

    const stopAction = trailingStop(symbol, pnl)
    if (stopAction.triggered) await recordEvent('stop_loss', position, stopAction)

    const volAction = volatilityGuard(symbol, volatility)
    if (volAction.adjust) await recordEvent('volatility_guard', position, volAction)

    const rebalanceAction = await rebalanceEngine.evaluate(symbol, exposure, ai_signal)
    if (rebalanceAction.triggered) await recordEvent('rebalance', position, rebalanceAction)
  }
}

async function recordEvent(eventType: string, position: any, action: any) {
  await supabase.from('trade_monitor_events').insert([
    {
      trade_id: position.trade_id,
      symbol: position.symbol,
      event_type: eventType,
      old_position: position.size,
      new_position: action.new_size,
      reason: action.reason,
      confidence: action.confidence,
      ai_signal: action.ai_signal
    }
  ])
}