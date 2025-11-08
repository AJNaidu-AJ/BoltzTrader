import { TradeMonitorPanel } from '@/components/dashboard/TradeMonitorPanel'
import { RebalanceSummaryCard } from '@/components/dashboard/RebalanceSummaryCard'
import { AlertsFeed } from '@/components/dashboard/AlertsFeed'

export default function TradeMonitorPage() {
  const userId = "user-123" // Get from auth context
  const portfolio = { holdings: [] } // Get from portfolio context
  const rebalanceData = { lastRebalance: "2 hours ago", actionsToday: 3 }
  const alerts = [
    { type: "warning", message: "High volatility detected in BTC", timestamp: "5 min ago" },
    { type: "error", message: "Stop loss triggered for ETH position", timestamp: "1 hour ago" }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Trade Monitoring & Auto-Rebalancing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TradeMonitorPanel userId={userId} portfolio={portfolio} />
        <RebalanceSummaryCard rebalanceData={rebalanceData} />
        <AlertsFeed alerts={alerts} />
      </div>
    </div>
  )
}