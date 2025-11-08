import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AnalyticsChartsProps {
  type: 'cumulative-pnl' | 'returns-histogram' | 'rolling-winrate' | 'trade-frequency'
  data: any[]
}

export function AnalyticsCharts({ type, data }: AnalyticsChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  switch (type) {
    case 'cumulative-pnl':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cumulative_pnl" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'returns-histogram':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="return_bucket" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'rolling-winrate':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} />
            <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Win Rate']} />
            <Line type="monotone" dataKey="win_rate" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'trade-frequency':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="trade_count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      )

    default:
      return <div>Chart type not supported</div>
  }
}