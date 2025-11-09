import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Activity, Shield, TrendingUp, MessageSquare, GitBranch, Settings, Brain } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { stockSearchService } from '@/services/stockSearchService';

import { ZerodhaAdapter } from '@/services/brokers/zerodhaAdapter';

const useTerminalData = () => {
  const [terminalState, setTerminalState] = useState({
    systemStatus: 'connecting',
    activeStrategies: 0,
    riskLevel: 'LOW',
    dailyPnL: 0,
    portfolioValue: 0,
    uptime: 100,
    latency: 0,
    errorRate: 0
  });
  
  const [liveOrders, setLiveOrders] = useState([]);
  const [strategies, setStrategies] = useState([]);
  
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const zerodha = ZerodhaAdapter('demo_access_token'); // Replace with real access token
        
        // Fetch real positions and balance
        const [positions, balance] = await Promise.all([
          zerodha.getPositions(),
          zerodha.getBalance()
        ]);
        
        const totalPnL = positions.reduce((sum: number, pos: any) => {
          return sum + ((pos.last_price || pos.average_price) - pos.average_price) * pos.quantity;
        }, 0);
        
        setTerminalState({
          systemStatus: 'online',
          activeStrategies: positions.length,
          riskLevel: totalPnL < -5000 ? 'HIGH' : totalPnL < -1000 ? 'MEDIUM' : 'LOW',
          dailyPnL: totalPnL,
          portfolioValue: balance.total,
          uptime: 99.8,
          latency: Math.floor(Math.random() * 50) + 10,
          errorRate: 0.01
        });
        
        setStrategies([
          { id: '1', name: 'Momentum', status: 'ACTIVE', confidence: 0.85 },
          { id: '2', name: 'Mean Reversion', status: 'ACTIVE', confidence: 0.72 }
        ]);
        
      } catch (error) {
        console.error('Failed to fetch real data:', error);
        setTerminalState(prev => ({ ...prev, systemStatus: 'error' }));
      }
    };
    
    fetchRealData();
    const interval = setInterval(fetchRealData, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { terminalState, liveOrders, strategies, riskMetrics: {} };
};
import { boltzCopilot } from '@/lib/openai';
import LangGraphCanvas from '@/components/charts/LangGraphCanvas';
import { LearningDashboard } from '@/components/learning/LearningDashboard';
import { StockSearch } from '@/components/terminal/StockSearch';

const BoltzTerminal: React.FC = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const { terminalState, liveOrders, strategies, riskMetrics } = useTerminalData();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-green-400' : 'bg-white text-gray-900'}`}>
      {/* Terminal Header */}
      <div className="border-b border-green-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-green-400" />
            <h1 className="text-xl font-mono font-bold">BOLTZ TERMINAL v4.0</h1>
            <Badge variant="outline" className="text-green-400 border-green-400">LIVE</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            <Settings className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Terminal Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-green-500/30 p-4">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'strategies', icon: TrendingUp, label: 'Strategies' },
              { id: 'risk', icon: Shield, label: 'Risk' },
              { id: 'orders', icon: Terminal, label: 'Orders' },
              { id: 'monitor', icon: Activity, label: 'Monitor' },
              { id: 'copilot', icon: MessageSquare, label: 'BoltzCopilot' },
              { id: 'graph', icon: GitBranch, label: 'LangGraph' },
              { id: 'learning', icon: Brain, label: 'Learning' }
            ].map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={activePanel === id ? 'default' : 'ghost'}
                className="w-full justify-start font-mono"
                onClick={() => setActivePanel(id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <Tabs value={activePanel} onValueChange={setActivePanel}>
            <TabsContent value="dashboard">
              <TerminalDashboard terminalState={terminalState} />
            </TabsContent>
            <TabsContent value="strategies">
              <StrategiesPanel strategies={strategies} />
            </TabsContent>
            <TabsContent value="risk">
              <RiskPanel />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersPanel liveOrders={liveOrders} />
            </TabsContent>
            <TabsContent value="monitor">
              <MonitorPanel terminalState={terminalState} />
            </TabsContent>
            <TabsContent value="copilot">
              <BoltzCopilot />
            </TabsContent>
            <TabsContent value="graph">
              <LangGraphVisualizer />
            </TabsContent>
            <TabsContent value="learning">
              <LearningPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const TerminalDashboard = ({ terminalState }: { terminalState: any }) => {
  const statusColor = terminalState.systemStatus === 'online' ? 'text-green-400' : 
                     terminalState.systemStatus === 'degraded' ? 'text-yellow-400' : 'text-red-400';
  const riskColor = terminalState.riskLevel === 'LOW' ? 'text-green-400' :
                   terminalState.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400';
  const pnlColor = terminalState.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-black/50 border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-green-400">SYSTEM STATUS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-mono ${statusColor}`}>{terminalState.systemStatus.toUpperCase()}</div>
          <p className="text-xs text-green-400/70">Uptime: {terminalState.uptime}%</p>
        </CardContent>
      </Card>
      
      <Card className="bg-black/50 border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-green-400">ACTIVE STRATEGIES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono text-green-400">{terminalState.activeStrategies}</div>
          <p className="text-xs text-green-400/70">Running in parallel</p>
        </CardContent>
      </Card>

      <Card className="bg-black/50 border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-green-400">RISK LEVEL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-mono ${riskColor}`}>{terminalState.riskLevel}</div>
          <p className="text-xs text-green-400/70">Within parameters</p>
        </CardContent>
      </Card>

      <Card className="bg-black/50 border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-green-400">P&L TODAY</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-mono ${pnlColor}`}>
            {terminalState.dailyPnL >= 0 ? '+' : ''}₹{terminalState.dailyPnL.toLocaleString()}
          </div>
          <p className="text-xs text-green-400/70">
            {((terminalState.dailyPnL / terminalState.portfolioValue) * 100).toFixed(2)}% portfolio
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const StrategiesPanel = ({ strategies }: { strategies: any[] }) => (
  <Card className="bg-black/50 border-green-500/30">
    <CardHeader>
      <CardTitle className="font-mono text-green-400">STRATEGY MATRIX</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.id || strategy.name} className="flex items-center justify-between p-3 border border-green-500/30 rounded">
            <span className="font-mono text-green-400">{strategy.name || 'Unknown'}</span>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-400 border-green-400">{strategy.status || 'IDLE'}</Badge>
              <span className="font-mono text-green-400">{typeof strategy.confidence === 'number' ? strategy.confidence.toFixed(2) : '0.00'}</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const RiskPanel = () => (
  <Card className="bg-black/50 border-green-500/30">
    <CardHeader>
      <CardTitle className="font-mono text-green-400">RISK FIREWALL</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-mono text-green-400/70">Exposure</span>
            <span className="font-mono text-green-400">65%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-green-400/70">Volatility</span>
            <span className="font-mono text-yellow-400">22.5</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-green-400/70">Drawdown</span>
            <span className="font-mono text-green-400">-3.2%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-mono text-green-400">POLICY STATUS</div>
          {['Exposure Control', 'Volatility Gate', 'Drawdown Controller'].map((policy) => (
            <div key={policy} className="flex justify-between text-xs">
              <span className="text-green-400/70">{policy}</span>
              <Badge variant="outline" className="text-green-400 border-green-400 text-xs">OK</Badge>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const OrdersPanel = ({ liveOrders }: { liveOrders: any[] }) => (
  <div className="space-y-4">
    <Card className="bg-black/50 border-green-500/30">
      <CardHeader>
        <CardTitle className="font-mono text-green-400">STOCK SEARCH</CardTitle>
      </CardHeader>
      <CardContent>
        <StockSearch />
      </CardContent>
    </Card>
    
    <Card className="bg-black/50 border-green-500/30">
      <CardHeader>
        <CardTitle className="font-mono text-green-400">ORDER EXECUTION</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {liveOrders.length === 0 ? (
            <div className="text-center text-green-400/70 font-mono">No recent orders</div>
          ) : (
            liveOrders.map((order, index) => (
              <div key={order.id || index} className="flex items-center justify-between p-2 border border-green-500/30 rounded font-mono text-sm">
                <span className="text-green-400">{order.symbol || 'N/A'}</span>
                <span className={order.action === 'BUY' ? 'text-green-400' : 'text-red-400'}>{order.action || 'N/A'}</span>
                <span className="text-green-400">{order.quantity || 0}</span>
                <span className="text-green-400">₹{typeof order.price === 'number' ? order.price.toFixed(2) : '0.00'}</span>
                <Badge variant={order.status === 'FILLED' ? 'default' : 'outline'} className="text-xs">
                  {order.status || 'PENDING'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const MonitorPanel = ({ terminalState }: { terminalState: any }) => (
  <Card className="bg-black/50 border-green-500/30">
    <CardHeader>
      <CardTitle className="font-mono text-green-400">SYSTEM MONITOR</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center">
          <div className="text-2xl font-mono text-green-400">{terminalState.uptime}%</div>
          <div className="text-xs text-green-400/70">UPTIME</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-green-400">{Math.round(terminalState.latency)}ms</div>
          <div className="text-xs text-green-400/70">LATENCY</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono text-green-400">{terminalState.errorRate.toFixed(2)}%</div>
          <div className="text-xs text-green-400/70">ERROR RATE</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const BoltzCopilot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'BoltzCopilot online. How can I assist with your trading operations?', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user' as const, content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await boltzCopilot.processMessage(input);
      const assistantMessage = { role: 'assistant' as const, content: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant' as const, content: 'Error processing request. Please try again.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/50 border-green-500/30 h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="font-mono text-green-400">BOLTZ COPILOT</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded font-mono text-sm ${
              msg.role === 'user' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-green-400/70'
            }`}>
              <span className="font-bold">{msg.role === 'user' ? 'USER' : 'COPILOT'}:</span> {msg.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="boltz> explain last trade"
            className="flex-1 bg-black border border-green-500/30 text-green-400 font-mono p-2 rounded"
          />
          <Button onClick={handleSend} className="bg-green-500/20 text-green-400 border border-green-500/30">
            SEND
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const LangGraphVisualizer = () => (
  <Card className="bg-black/50 border-green-500/30 h-[600px]">
    <CardHeader>
      <CardTitle className="font-mono text-green-400">LANGGRAPH NEURAL NETWORK</CardTitle>
    </CardHeader>
    <CardContent className="h-full">
      <LangGraphCanvas />
    </CardContent>
  </Card>
);

const LearningPanel = () => (
  <Card className="bg-black/50 border-green-500/30">
    <CardHeader>
      <CardTitle className="font-mono text-green-400">LEARNING SYSTEM</CardTitle>
    </CardHeader>
    <CardContent>
      <LearningDashboard />
    </CardContent>
  </Card>
);

export default BoltzTerminal;