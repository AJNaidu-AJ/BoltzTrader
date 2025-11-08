import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PredictiveMetric {
  id: string
  strategy_id: string
  symbol: string
  timeframe: string
  predicted_return: number
  predicted_volatility: number
  confidence: number
  model_version: string
  computed_at: string
}

export default function PredictiveDashboard() {
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPredictions()
  }, [selectedTimeframe])

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      // TODO: Fetch from API
      const mockData: PredictiveMetric[] = [
        {
          id: '1',
          strategy_id: 'momentum-1',
          symbol: 'BTCUSDT',
          timeframe: '1d',
          predicted_return: 0.025,
          predicted_volatility: 0.15,
          confidence: 0.78,
          model_version: '1.0.0',
          computed_at: new Date().toISOString()
        },
        {
          id: '2',
          strategy_id: 'mean-reversion-1',
          symbol: 'ETHUSDT',
          timeframe: '1d',
          predicted_return: -0.01,
          predicted_volatility: 0.12,
          confidence: 0.65,
          model_version: '1.0.0',
          computed_at: new Date().toISOString()
        }
      ]
      setPredictions(mockData)
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const scatterData = predictions.map(p => ({
    confidence: p.confidence,
    predicted_return: p.predicted_return * 100,
    symbol: p.symbol,
    volatility: p.predicted_volatility * 100
  }))

  if (loading) {
    return <div className="container mx-auto p-6">Loading predictions...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Predictive Analytics Dashboard</h1>
        
        <div className="flex gap-4 mb-6">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Avg Predicted Return</h3>
          <p className="text-3xl font-bold text-green-600">
            {predictions.length > 0 
              ? `${(predictions.reduce((sum, p) => sum + p.predicted_return, 0) / predictions.length * 100).toFixed(2)}%`
              : '0%'
            }
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Avg Confidence</h3>
          <p className="text-3xl font-bold">
            {predictions.length > 0 
              ? `${(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(1)}%`
              : '0%'
            }
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-2">Active Predictions</h3>
          <p className="text-3xl font-bold">{predictions.length}</p>
        </div>
      </div>

      {/* Confidence vs Return Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Confidence vs Predicted Return</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="confidence" 
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis 
                dataKey="predicted_return"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'predicted_return' ? `${value.toFixed(2)}%` : `${(value * 100).toFixed(1)}%`,
                  name === 'predicted_return' ? 'Return' : 'Confidence'
                ]}
              />
              <Scatter dataKey="predicted_return" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Volatility Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="volatility"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <YAxis 
                dataKey="predicted_return"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip />
              <Scatter dataKey="predicted_return" fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Detailed Predictions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Timeframe</th>
                  <th className="text-left py-2">Predicted Return</th>
                  <th className="text-left py-2">Volatility</th>
                  <th className="text-left py-2">Confidence</th>
                  <th className="text-left py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.id} className="border-b">
                    <td className="py-2 font-medium">{prediction.symbol}</td>
                    <td className="py-2">{prediction.timeframe}</td>
                    <td className={`py-2 font-medium ${
                      prediction.predicted_return >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(prediction.predicted_return * 100).toFixed(2)}%
                    </td>
                    <td className="py-2">{(prediction.predicted_volatility * 100).toFixed(1)}%</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(prediction.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-sm text-muted-foreground">
                      {new Date(prediction.computed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}