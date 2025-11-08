import { useTradeMonitor } from '@/hooks/useTradeMonitor'

export const TradeMonitorPanel = ({ userId, portfolio }) => {
  const events = useTradeMonitor(userId, portfolio)

  return (
    <div className="rounded-xl border p-4 bg-card shadow-sm space-y-2">
      <h3 className="font-semibold text-lg">Live Trade Monitoring</h3>
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">No alerts detected. Portfolio stable.</p>
      ) : (
        events.map((e) => (
          <div key={e.id} className="border-l-4 pl-2" style={{ borderColor: e.event_type === 'rebalance' ? '#3b82f6' : '#ef4444' }}>
            <p className="text-sm font-medium">{e.symbol} — {e.event_type}</p>
            <p className="text-xs text-gray-500">{e.reason}</p>
          </div>
        ))
      )}
    </div>
  )
}