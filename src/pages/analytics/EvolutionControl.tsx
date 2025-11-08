import { useState, useEffect } from 'react'

interface EvolutionDecision {
  action: string
  reason: string
  score: number
  confidence: number
}

interface Recommendation {
  type: string
  suggestion: string
  priority: 'low' | 'medium' | 'high'
}

export default function EvolutionControl() {
  const [decision, setDecision] = useState<EvolutionDecision | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState('momentum-1')

  useEffect(() => {
    fetchEvolutionData()
  }, [selectedStrategy])

  const fetchEvolutionData = async () => {
    try {
      setLoading(true)
      
      // Mock decision data
      const mockDecision: EvolutionDecision = {
        action: 'INCREASE_WEIGHT',
        reason: 'Strong predictive signal for improvement',
        score: 0.045,
        confidence: 0.82
      }
      
      const mockRecommendations: Recommendation[] = [
        {
          type: 'win_rate_improvement',
          suggestion: 'Consider tightening entry criteria',
          priority: 'high'
        },
        {
          type: 'return_improvement',
          suggestion: 'Evaluate position sizing strategy',
          priority: 'medium'
        }
      ]
      
      setDecision(mockDecision)
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Failed to fetch evolution data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyEvolution = async () => {
    if (!decision) return
    
    try {
      setLoading(true)
      // TODO: Apply evolution via API
      console.log('Applying evolution:', decision)
      
      // Show success message
      alert('Evolution applied successfully!')
    } catch (error) {
      console.error('Failed to apply evolution:', error)
      alert('Failed to apply evolution')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INCREASE_WEIGHT':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'REBALANCE':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'HOLD':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Strategy Evolution Control</h1>
        
        <div className="flex gap-4 mb-6">
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="momentum-1">Momentum Strategy</option>
            <option value="mean-reversion-1">Mean Reversion Strategy</option>
            <option value="breakout-1">Breakout Strategy</option>
          </select>
          
          <button
            onClick={fetchEvolutionData}
            disabled={loading}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Decision */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Evolution Decision</h2>
          
          {decision ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${getActionColor(decision.action)}`}>
                <h3 className="font-semibold text-lg mb-2">Recommended Action</h3>
                <p className="text-2xl font-bold">{decision.action.replace('_', ' ')}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Improvement Score:</span>
                  <span className={`font-medium ${decision.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(decision.score * 100).toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{(decision.confidence * 100).toFixed(1)}%</span>
                </div>
                
                <div className="mt-3">
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="mt-1">{decision.reason}</p>
                </div>
              </div>
              
              <button
                onClick={applyEvolution}
                disabled={loading || decision.action === 'HOLD'}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Applying...' : 'Apply Evolution'}
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground">No decision available</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Strategy Recommendations</h2>
          
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{rec.type.replace('_', ' ').toUpperCase()}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recommendations available</p>
            )}
          </div>
        </div>
      </div>

      {/* Evolution History */}
      <div className="mt-8 bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Recent Evolution History</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <div>
              <p className="font-medium">Position sizing adjustment</p>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              +2.3% improvement
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <div>
              <p className="font-medium">Entry criteria tightened</p>
              <p className="text-sm text-muted-foreground">1 day ago</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              +1.1% improvement
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}