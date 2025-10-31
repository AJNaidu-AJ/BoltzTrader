/**
 * Cognitive Network Visualization Component
 * Shows the LangGraph node network in real-time
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cognitiveApi, CognitiveResult } from '@/services/cognitiveApi';
import { Brain, Activity, TrendingUp, AlertTriangle, Play, Pause } from 'lucide-react';

interface NodeStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  lastUpdate: string;
  data?: any;
}

export const CognitiveNetwork: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [cognitiveResult, setCognitiveResult] = useState<CognitiveResult | null>(null);
  const [metrics, setMetrics] = useState<string>('');
  const [errorCount, setErrorCount] = useState(0);
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatus[]>([
    { id: 'data', name: 'Data Node', status: 'idle', lastUpdate: '' },
    { id: 'indicator', name: 'Indicator Node', status: 'idle', lastUpdate: '' },
    { id: 'sentiment', name: 'Sentiment Node', status: 'idle', lastUpdate: '' },
    { id: 'breakout', name: 'Breakout Node', status: 'idle', lastUpdate: '' },
    { id: 'strategy', name: 'Strategy Node', status: 'idle', lastUpdate: '' },
    { id: 'execution', name: 'Execution Node', status: 'idle', lastUpdate: '' },
    { id: 'monitor', name: 'Monitor Node', status: 'idle', lastUpdate: '' },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(async () => {
        await processCognitiveNetwork();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentSymbol]);

  const processCognitiveNetwork = async () => {
    try {
      const nodes = ['data', 'indicator', 'sentiment', 'breakout', 'strategy', 'execution', 'monitor'];
      
      for (let i = 0; i < nodes.length; i++) {
        const nodeId = nodes[i];
        
        setNodeStatuses(prev => prev.map(node => 
          node.id === nodeId 
            ? { ...node, status: 'active', lastUpdate: new Date().toLocaleTimeString() }
            : node
        ));
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const result = await cognitiveApi.processSymbol(currentSymbol);
      setCognitiveResult(result);
      
      // Track errors
      if (result.node_errors && result.node_errors.length > 0) {
        setErrorCount(prev => prev + result.node_errors!.length);
      }
      
      // Fetch metrics
      const metricsData = await cognitiveApi.getMetrics();
      setMetrics(metricsData);

      setTimeout(() => {
        setNodeStatuses(prev => prev.map(node => ({ ...node, status: 'idle' })));
      }, 1000);

    } catch (error) {
      console.error('Error processing cognitive network:', error);
      setNodeStatuses(prev => prev.map(node => ({ ...node, status: 'error' })));
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600';
      case 'SELL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cognitive Network Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Stop' : 'Start'} Network
            </Button>
            
            <select
              value={currentSymbol}
              onChange={(e) => setCurrentSymbol(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="AAPL">AAPL</option>
              <option value="GOOGL">GOOGL</option>
              <option value="MSFT">MSFT</option>
              <option value="TSLA">TSLA</option>
            </select>

            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
            
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Errors
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Node Network Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nodeStatuses.map((node) => (
              <div
                key={node.id}
                className="p-4 border rounded-lg flex flex-col items-center space-y-2"
              >
                <div className={`w-4 h-4 rounded-full ${getNodeStatusColor(node.status)}`} />
                <span className="font-medium text-sm">{node.name}</span>
                <span className="text-xs text-gray-500">{node.lastUpdate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {cognitiveResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-mono">${cognitiveResult.market_data.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className={`font-mono ${cognitiveResult.market_data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cognitiveResult.market_data.change >= 0 ? '+' : ''}{cognitiveResult.market_data.change_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span className="font-mono">{cognitiveResult.market_data.volume.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>RSI:</span>
                  <span className="font-mono">{cognitiveResult.indicators.rsi.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>MACD:</span>
                  <span className="font-mono">{cognitiveResult.indicators.macd.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volatility:</span>
                  <span className="font-mono">{cognitiveResult.indicators.volatility.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Strategy Decision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Action:</span>
                  <Badge className={getActionColor(cognitiveResult.strategy_decision.action)}>
                    {cognitiveResult.strategy_decision.action}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-mono">{(cognitiveResult.strategy_decision.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <Badge variant={cognitiveResult.strategy_decision.risk_level === 'LOW' ? 'default' : 'destructive'}>
                    {cognitiveResult.strategy_decision.risk_level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};