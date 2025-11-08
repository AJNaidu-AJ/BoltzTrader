import { useState, useEffect } from 'react'

interface HedgePosition {
  id: string
  base_symbol: string
  hedge_symbol: string
  hedge_ratio: number
  correlation: number
  status: 'active' | 'inactive'
  pnl: number
  effectiveness: number
}

interface MarketRegime {
  regime: string
  confidence: number
  indicators: {
    vix: string
    correlation: string
    volatility: string
  }
  hedging_strategy: string
}

export default function HedgingControl() {
  const [hedgePositions, setHedgePositions] = useState<HedgePosition[]>([])
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null)
  const [autoHedgingEnabled, setAutoHedgingEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHedgingData()
  }, [])

  const fetchHedgingData = async () => {
    try {
      // TODO: Fetch from API
      const mockPositions: HedgePosition[] = [
        {
          id: '1',
          base_symbol: 'BTCUSDT',
          hedge_symbol: 'ETHUSDT',
          hedge_ratio: 0.8,
          correlation: 0.85,
          status: 'active',
          pnl: 125.50,
          effectiveness: 0.78
        },
        {
          id: '2',
          base_symbol: 'SPY',
          hedge_symbol: 'VIX',
          hedge_ratio: -0.6,
          correlation: -0.78,
          status: 'active',
          pnl: -45.20,
          effectiveness: 0.82
        },
        {
          id: '3',
          base_symbol: 'AAPL',
          hedge_symbol: 'QQQ',
          hedge_ratio: 0.9,
          correlation: 0.72,
          status: 'inactive',
          pnl: 0,
          effectiveness: 0.65
        }
      ]

      const mockRegime: MarketRegime = {
        regime: 'Risk-On',
        confidence: 0.72,
        indicators: {
          vix: 'Low',
          correlation: 'Moderate',
          volatility: 'Normal'
        },
        hedging_strategy: 'Reduce hedge ratios in risk-on environment'
      }

      setHedgePositions(mockPositions)
      setMarketRegime(mockRegime)
    } catch (error) {
      console.error('Failed to fetch hedging data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoHedging = () => {
    setAutoHedgingEnabled(!autoHedgingEnabled)
    // TODO: Update via API
  }

  const toggleHedgePosition = (id: string) => {
    setHedgePositions(positions =>
      positions.map(pos =>
        pos.id === id
          ? { ...pos, status: pos.status === 'active' ? 'inactive' : 'active' }
          : pos
      )
    )
    // TODO: Update via API
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
  }

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Risk-On': return 'text-green-600 bg-green-50'
      case 'Risk-Off': return 'text-red-600 bg-red-50'
      case 'Neutral': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading hedging data...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Hedging Control Center</h1>
        
        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-hedging"
              checked={autoHedgingEnabled}
              onChange={toggleAutoHedging}
              className="rounded"
            />
            <label htmlFor="auto-hedging" className="font-medium">
              Auto-Hedging Enabled
            </label>
          </div>
          
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            Rebalance All Hedges
          </button>
        </div>

        {/* Market Regime */}
        {marketRegime && (
          <div className="bg-card p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-semibold mb-4">Market Regime Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded font-medium ${getRegimeColor(marketRegime.regime)}`}>
                    {marketRegime.regime}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {(marketRegime.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">VIX Level:</span>
                    <span className="text-sm font-medium">{marketRegime.indicators.vix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Correlation:</span>
                    <span className="text-sm font-medium">{marketRegime.indicators.correlation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Volatility:</span>
                    <span className="text-sm font-medium">{marketRegime.indicators.volatility}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Strategy Recommendation</h3>
                <p className="text-sm text-muted-foreground">
                  {marketRegime.hedging_strategy}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Hedge Positions */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Hedge Positions</h2>
          
          <div className="space-y-4">
            {hedgePositions.map((position) => (
              <div key={position.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">
                      {position.base_symbol} / {position.hedge_symbol}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Hedge Ratio: {position.hedge_ratio.toFixed(2)} | 
                      Correlation: {position.correlation.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(position.status)}`}>
                      {position.status.toUpperCase()}
                    </span>
                    
                    <button
                      onClick={() => toggleHedgePosition(position.id)}
                      className="px-3 py-1 text-xs border rounded hover:bg-muted"
                    >
                      {position.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">P&L</div>
                    <div className={`font-medium ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${position.pnl.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Effectiveness</div>
                    <div className="font-medium">{(position.effectiveness * 100).toFixed(0)}%</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Risk Reduction</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${position.effectiveness * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-1">Total Hedge P&L</h3>
          <p className="text-2xl font-bold text-green-600">
            ${hedgePositions.reduce((sum, pos) => sum + pos.pnl, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-1">Active Hedges</h3>
          <p className="text-2xl font-bold">
            {hedgePositions.filter(pos => pos.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm text-muted-foreground mb-1">Avg Effectiveness</h3>
          <p className="text-2xl font-bold">
            {(hedgePositions.reduce((sum, pos) => sum + pos.effectiveness, 0) / hedgePositions.length * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  )
}