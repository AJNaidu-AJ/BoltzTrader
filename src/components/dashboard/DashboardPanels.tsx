// Dashboard versions of terminal panels for AppLayout
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Shield, TrendingUp, Terminal, MessageSquare, GitBranch, Brain } from 'lucide-react';
import { boltzCopilot } from '@/lib/openai';
import LangGraphCanvas from '@/components/charts/LangGraphCanvas';
import { LearningDashboard } from '@/components/learning/LearningDashboard';

// Mock data (same as terminal)
const terminalData = {
  systemStatus: 'online',
  activeStrategies: 4,
  riskLevel: 'MEDIUM',
  dailyPnL: 2847,
  portfolioValue: 250000,
  uptime: 99.9,
  latency: 45,
  errorRate: 0.01
};

const strategies = [
  { id: '1', name: 'Momentum', status: 'ACTIVE', confidence: 0.85 },
  { id: '2', name: 'Mean Reversion', status: 'ACTIVE', confidence: 0.72 },
  { id: '3', name: 'Breakout', status: 'ACTIVE', confidence: 0.68 },
  { id: '4', name: 'Sentiment Fusion', status: 'ACTIVE', confidence: 0.91 }
];

export const DashboardOverview = () => {
  const statusColor = terminalData.systemStatus === 'online' ? 'text-green-600' : 'text-red-600';
  const riskColor = terminalData.riskLevel === 'LOW' ? 'text-green-600' : 
                   terminalData.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600';
  const pnlColor = terminalData.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${statusColor}`}>
            {terminalData.systemStatus.toUpperCase()}
          </div>
          <p className="text-xs text-muted-foreground">Uptime: {terminalData.uptime}%</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Active Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{terminalData.activeStrategies}</div>
          <p className="text-xs text-muted-foreground">Running in parallel</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Risk Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${riskColor}`}>{terminalData.riskLevel}</div>
          <p className="text-xs text-muted-foreground">Within parameters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">P&L Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${pnlColor}`}>
            {terminalData.dailyPnL >= 0 ? '+' : ''}${terminalData.dailyPnL.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {((terminalData.dailyPnL / terminalData.portfolioValue) * 100).toFixed(2)}% portfolio
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardStrategies = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Strategy Matrix
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="flex items-center justify-between p-3 border rounded">
            <span className="font-medium">{strategy.name}</span>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{strategy.status}</Badge>
              <span className="font-mono">{strategy.confidence.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const DashboardRisk = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Risk Management
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exposure</span>
            <span className="font-medium">65%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Volatility</span>
            <span className="font-medium text-yellow-600">22.5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Drawdown</span>
            <span className="font-medium text-green-600">-3.2%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Policy Status</div>
          {['Exposure Control', 'Volatility Gate', 'Drawdown Controller'].map((policy) => (
            <div key={policy} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{policy}</span>
              <Badge variant="outline" className="text-xs">OK</Badge>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardOrders = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Terminal className="h-5 w-5" />
        Order Execution
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center text-muted-foreground py-8">
        No recent orders
      </div>
    </CardContent>
  </Card>
);

export const DashboardMonitor = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        System Monitor
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center">
          <div className="text-2xl font-bold">{terminalData.uptime}%</div>
          <div className="text-xs text-muted-foreground">UPTIME</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{Math.round(terminalData.latency)}ms</div>
          <div className="text-xs text-muted-foreground">LATENCY</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{terminalData.errorRate.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">ERROR RATE</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardCopilot = () => {
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          BoltzCopilot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded text-sm ${
              msg.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
            }`}>
              <span className="font-bold">{msg.role === 'user' ? 'You' : 'Copilot'}:</span> {msg.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about trading strategies..."
            className="flex-1 border rounded px-3 py-2"
          />
          <Button onClick={handleSend} disabled={loading}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardLangGraph = () => (
  <Card className="h-[600px]">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <GitBranch className="h-5 w-5" />
        LangGraph Neural Network
      </CardTitle>
    </CardHeader>
    <CardContent className="h-full">
      <LangGraphCanvas />
    </CardContent>
  </Card>
);

export const DashboardLearning = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        Learning System
      </CardTitle>
    </CardHeader>
    <CardContent>
      <LearningDashboard />
    </CardContent>
  </Card>
);