import { useState, useEffect } from 'react'
import { AnalyticsCharts } from './components/AnalyticsCharts'

export default function AnalyticsDashboard() {
  const [scope, setScope] = useState('global:user')
  const [timeframe, setTimeframe] = useState('30d')
  const [analytics, setAnalytics] = useState(null)
  const [tradeHistory, setTradeHistory] = useState([])

  useEffect(() => {
    fetchAnalytics()
    fetchTradeHistory()
  }, [scope, timeframe])

  const fetchAnalytics = async () => {
    // TODO: Fetch analytics from API
  }

  const fetchTradeHistory = async () => {
    // TODO: Fetch trade history for charts
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
        
        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="global:user">All Trades</option>
            <option value="symbol:BTCUSDT">BTC/USDT</option>
            <option value="symbol:ETHUSDT">ETH/USDT</option>
            <option value="strategy:momentum">Momentum Strategy</option>
          </select>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Total Trades</h3>
          <p className="text-3xl font-bold">{analytics?.total_trades || 0}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Win Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.win_rate ? `${(analytics.win_rate * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Avg Return</h3>
          <p className="text-3xl font-bold">
            {analytics?.avg_return ? `${(analytics.avg_return * 100).toFixed(2)}%` : '0%'}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Max Drawdown</h3>
          <p className="text-3xl font-bold text-red-600">
            {analytics?.max_drawdown ? `${(analytics.max_drawdown * 100).toFixed(2)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Cumulative P&L</h2>
          <AnalyticsCharts type="cumulative-pnl" data={tradeHistory} />
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Returns Distribution</h2>
          <AnalyticsCharts type="returns-histogram" data={tradeHistory} />
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Rolling Win Rate</h2>
          <AnalyticsCharts type="rolling-winrate" data={tradeHistory} />
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Trade Frequency</h2>
          <AnalyticsCharts type="trade-frequency" data={tradeHistory} />
        </div>
      </div>
    </div>
  )
}