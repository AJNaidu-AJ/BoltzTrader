import { useState, useEffect } from 'react'

interface ConsensusData {
  consensus: string
  confidence: number
  score: number
  agreement: number
  votes: number
  agent_breakdown: {
    BUY: number
    SELL: number
    HOLD: number
  }
}

interface AgentVote {
  agent_id: string
  agent_name: string
  signal: string
  confidence: number
  weight: number
}

export default function ConsensusMonitor() {
  const [consensusData, setConsensusData] = useState<ConsensusData | null>(null)
  const [agentVotes, setAgentVotes] = useState<AgentVote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsensusData()
    const interval = setInterval(fetchConsensusData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchConsensusData = async () => {
    try {
      // TODO: Fetch from API
      const mockConsensus: ConsensusData = {
        consensus: 'BUY',
        confidence: 0.78,
        score: 0.45,
        agreement: 0.75,
        votes: 4,
        agent_breakdown: {
          BUY: 3,
          SELL: 0,
          HOLD: 1
        }
      }

      const mockVotes: AgentVote[] = [
        {
          agent_id: '1',
          agent_name: 'Momentum Agent',
          signal: 'BUY',
          confidence: 0.85,
          weight: 0.78
        },
        {
          agent_id: '2',
          agent_name: 'Risk Manager',
          signal: 'HOLD',
          confidence: 0.88,
          weight: 0.92
        },
        {
          agent_id: '3',
          agent_name: 'Sentiment Analyzer',
          signal: 'BUY',
          confidence: 0.72,
          weight: 0.65
        },
        {
          agent_id: '4',
          agent_name: 'Macro Analyst',
          signal: 'BUY',
          confidence: 0.79,
          weight: 0.81
        }
      ]

      setConsensusData(mockConsensus)
      setAgentVotes(mockVotes)
    } catch (error) {
      console.error('Failed to fetch consensus data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case 'BUY': return 'text-green-600 bg-green-50 border-green-200'
      case 'SELL': return 'text-red-600 bg-red-50 border-red-200'
      case 'HOLD': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-600'
      case 'SELL': return 'text-red-600'
      case 'HOLD': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading consensus data...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Consensus Monitor</h1>
        
        {/* Current Consensus */}
        {consensusData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-6 rounded-lg border ${getConsensusColor(consensusData.consensus)}`}>
              <h3 className="text-sm font-medium mb-2">Current Consensus</h3>
              <p className="text-3xl font-bold">{consensusData.consensus}</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm text-muted-foreground mb-2">Confidence</h3>
              <p className="text-3xl font-bold">{(consensusData.confidence * 100).toFixed(1)}%</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${consensusData.confidence * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm text-muted-foreground mb-2">Agreement</h3>
              <p className="text-3xl font-bold">{(consensusData.agreement * 100).toFixed(1)}%</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${consensusData.agreement * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm text-muted-foreground mb-2">Total Votes</h3>
              <p className="text-3xl font-bold">{consensusData.votes}</p>
            </div>
          </div>
        )}

        {/* Vote Breakdown */}
        {consensusData && (
          <div className="bg-card p-6 rounded-lg border mb-8">
            <h2 className="text-lg font-semibold mb-4">Vote Breakdown</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {consensusData.agent_breakdown.BUY}
                </div>
                <div className="text-sm text-muted-foreground">BUY Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {consensusData.agent_breakdown.SELL}
                </div>
                <div className="text-sm text-muted-foreground">SELL Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {consensusData.agent_breakdown.HOLD}
                </div>
                <div className="text-sm text-muted-foreground">HOLD Votes</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Individual Agent Votes */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Agent Votes</h2>
          <div className="space-y-4">
            {agentVotes.map((vote) => (
              <div key={vote.agent_id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium">{vote.agent_name}</h3>
                    <p className="text-sm text-muted-foreground">Weight: {(vote.weight * 100).toFixed(0)}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getSignalColor(vote.signal)}`}>
                      {vote.signal}
                    </div>
                    <div className="text-xs text-muted-foreground">Signal</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {(vote.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                  
                  <div className="w-24">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${vote.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}