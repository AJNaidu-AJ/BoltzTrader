import { useState, useEffect } from 'react'

interface CorrelationData {
  [symbol: string]: {
    [relatedSymbol: string]: number
  }
}

interface HedgePair {
  base_symbol: string
  hedge_symbol: string
  correlation: number
  strength: string
}

export default function CorrelationDashboard() {
  const [correlations, setCorrelations] = useState<CorrelationData>({})
  const [hedgePairs, setHedgePairs] = useState<HedgePair[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCorrelationData()
  }, [])

  const fetchCorrelationData = async () => {
    try {
      // TODO: Fetch from API
      const mockCorrelations: CorrelationData = {
        'BTCUSDT': {
          'ETHUSDT': 0.85,
          'ADAUSDT': 0.72,
          'SPY': -0.15,
          'GLD': -0.32
        },
        'ETHUSDT': {
          'BTCUSDT': 0.85,
          'ADAUSDT': 0.68,
          'SPY': -0.12,
          'GLD': -0.28
        },
        'SPY': {
          'QQQ': 0.92,
          'BTCUSDT': -0.15,
          'GLD': -0.45,
          'VIX': -0.78
        },
        'GLD': {
          'BTCUSDT': -0.32,
          'SPY': -0.45,
          'DXY': 0.65,
          'TLT': 0.38
        }
      }

      const mockHedgePairs: HedgePair[] = [
        {
          base_symbol: 'BTCUSDT',
          hedge_symbol: 'ETHUSDT',
          correlation: 0.85,
          strength: 'Strong'
        },
        {
          base_symbol: 'SPY',
          hedge_symbol: 'QQQ',
          correlation: 0.92,
          strength: 'Strong'
        },
        {
          base_symbol: 'SPY',
          hedge_symbol: 'VIX',
          correlation: -0.78,
          strength: 'Strong'
        },
        {
          base_symbol: 'BTCUSDT',
          hedge_symbol: 'ADAUSDT',
          correlation: 0.72,
          strength: 'Moderate'
        }
      ]

      setCorrelations(mockCorrelations)
      setHedgePairs(mockHedgePairs)
      setSelectedSymbol('BTCUSDT')
    } catch (error) {
      console.error('Failed to fetch correlation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.8) return correlation > 0 ? 'bg-green-500' : 'bg-red-500'
    if (abs >= 0.6) return correlation > 0 ? 'bg-green-400' : 'bg-red-400'
    if (abs >= 0.4) return correlation > 0 ? 'bg-green-300' : 'bg-red-300'
    if (abs >= 0.2) return correlation > 0 ? 'bg-green-200' : 'bg-red-200'
    return 'bg-gray-200'
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'text-green-600 bg-green-50'
      case 'Moderate': return 'text-yellow-600 bg-yellow-50'
      case 'Weak': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const symbols = Object.keys(correlations)

  if (loading) {
    return <div className="container mx-auto p-6">Loading correlation data...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Cross-Market Correlation Dashboard</h1>
        
        <div className="flex gap-4 mb-6">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Matrix */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Correlation Matrix</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium">Symbol</th>
                  {symbols.slice(0, 4).map(symbol => (
                    <th key={symbol} className="text-center p-2 font-medium text-xs">
                      {symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {symbols.slice(0, 4).map(baseSymbol => (
                  <tr key={baseSymbol}>
                    <td className="p-2 font-medium">{baseSymbol}</td>
                    {symbols.slice(0, 4).map(relatedSymbol => {
                      const correlation = baseSymbol === relatedSymbol 
                        ? 1.0 
                        : correlations[baseSymbol]?.[relatedSymbol] || 0
                      
                      return (
                        <td key={relatedSymbol} className="p-2 text-center">
                          <div 
                            className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${getCorrelationColor(correlation)}`}
                          >
                            {correlation.toFixed(2)}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Positive Correlation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Negative Correlation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Symbol Details */}
        {selectedSymbol && correlations[selectedSymbol] && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">{selectedSymbol} Correlations</h2>
            
            <div className="space-y-3">
              {Object.entries(correlations[selectedSymbol])
                .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                .map(([symbol, correlation]) => (
                <div key={symbol} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div className="font-medium">{symbol}</div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getCorrelationColor(correlation)}`}
                        style={{ width: `${Math.abs(correlation) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-bold w-12 text-right">
                      {correlation.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hedge Pairs */}
      <div className="mt-8 bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Recommended Hedge Pairs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hedgePairs.map((pair, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    {pair.base_symbol} ↔ {pair.hedge_symbol}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Correlation: {pair.correlation.toFixed(2)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(pair.strength)}`}>
                  {pair.strength}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getCorrelationColor(pair.correlation)}`}
                  style={{ width: `${Math.abs(pair.correlation) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}