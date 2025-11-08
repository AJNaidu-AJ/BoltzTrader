import { useState, useEffect } from 'react'

interface Agent {
  id: string
  name: string
  type: string
  reliability: number
  confidence: number
  active: boolean
  lastSignal?: string
}

interface NetworkStatus {
  active_agents: number
  consensus_strength: number
  network_confidence: number
  last_update: string
}

export default function AgentMeshView() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
    fetchNetworkStatus()
  }, [])

  const fetchAgents = async () => {
    try {
      // TODO: Fetch from API
      const mockAgents: Agent[] = [
        {
          id: '1',
          name: 'Momentum Agent',
          type: 'strategy',
          reliability: 0.78,
          confidence: 0.85,
          active: true,
          lastSignal: 'BUY'
        },
        {
          id: '2',
          name: 'Risk Manager',
          type: 'risk',
          reliability: 0.92,
          confidence: 0.88,
          active: true,
          lastSignal: 'HOLD'
        },
        {
          id: '3',
          name: 'Sentiment Analyzer',
          type: 'sentiment',
          reliability: 0.65,
          confidence: 0.72,
          active: true,
          lastSignal: 'BUY'
        },
        {
          id: '4',
          name: 'Macro Analyst',
          type: 'macro',
          reliability: 0.81,
          confidence: 0.79,
          active: false,
          lastSignal: 'SELL'
        }
      ]
      setAgents(mockAgents)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    }
  }

  const fetchNetworkStatus = async () => {
    try {
      // TODO: Fetch from API
      const mockStatus: NetworkStatus = {
        active_agents: 3,
        consensus_strength: 0.74,
        network_confidence: 0.82,
        last_update: new Date().toISOString()
      }
      setNetworkStatus(mockStatus)
    } catch (error) {
      console.error('Failed to fetch network status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'strategy': return 'bg-blue-100 text-blue-800'
      case 'risk': return 'bg-red-100 text-red-800'
      case 'sentiment': return 'bg-green-100 text-green-800'
      case 'macro': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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
    return <div className="container mx-auto p-6">Loading agent mesh...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Agent Mesh Network</h1>
        
        {/* Network Status */}
        {networkStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-sm text-muted-foreground mb-1">Active Agents</h3>
              <p className="text-2xl font-bold">{networkStatus.active_agents}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-sm text-muted-foreground mb-1">Consensus Strength</h3>
              <p className="text-2xl font-bold text-blue-600">
                {(networkStatus.consensus_strength * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-sm text-muted-foreground mb-1">Network Confidence</h3>
              <p className="text-2xl font-bold text-green-600">
                {(networkStatus.network_confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-card p-6 rounded-lg border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getAgentTypeColor(agent.type)}`}>
                  {agent.type.toUpperCase()}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${agent.active ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Reliability</span>
                  <span>{(agent.reliability * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${agent.reliability * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Confidence</span>
                  <span>{(agent.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${agent.confidence * 100}%` }}
                  />
                </div>
              </div>

              {agent.lastSignal && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Last Signal</span>
                  <span className={`font-semibold ${getSignalColor(agent.lastSignal)}`}>
                    {agent.lastSignal}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Network Visualization */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Network Topology</h2>
        <div className="h-64 flex items-center justify-center bg-muted rounded">
          <p className="text-muted-foreground">Network graph visualization would be rendered here</p>
        </div>
      </div>
    </div>
  )
}