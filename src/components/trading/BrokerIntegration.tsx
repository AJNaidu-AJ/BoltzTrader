import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processSignal, generateMockSignal } from '@/services/ai/signalExecutor';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export function BrokerIntegration() {
  const [selectedBroker, setSelectedBroker] = useState('BINANCE');
  const [isConnected, setIsConnected] = useState(false);
  const [lastSignal, setLastSignal] = useState<any>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  const brokers = [
    { id: 'ZERODHA', name: 'Zerodha', flag: '🇮🇳', region: 'India' },
    { id: 'BINANCE', name: 'Binance', flag: '🌍', region: 'Global' },
    { id: 'ALPACA', name: 'Alpaca', flag: '🇺🇸', region: 'US' }
  ];

  const mockCredentials = {
    user_id: 'user_123',
    api_key: 'mock_api_key',
    api_secret: 'mock_api_secret',
    access_token: 'mock_access_token'
  };

  const handleConnect = () => {
    setIsConnected(!isConnected);
    console.log(`${isConnected ? 'Disconnected from' : 'Connected to'} ${selectedBroker}`);
  };

  const handleExecuteSignal = async () => {
    const signal = await generateMockSignal();
    setLastSignal(signal);
    
    const result = await processSignal('user_123', selectedBroker, mockCredentials, signal);
    
    setExecutionHistory(prev => [result, ...prev.slice(0, 4)]);
  };

  const getBrokerInfo = (brokerId: string) => {
    return brokers.find(b => b.id === brokerId) || brokers[1];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Broker Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Select Broker</label>
              <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brokers.map(broker => (
                    <SelectItem key={broker.id} value={broker.id}>
                      {broker.flag} {broker.name} ({broker.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleConnect}
                variant={isConnected ? 'destructive' : 'default'}
                className="w-full"
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {getBrokerInfo(selectedBroker).flag} {getBrokerInfo(selectedBroker).name}
              </span>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Signal Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleExecuteSignal}
            disabled={!isConnected}
            className="w-full"
          >
            Generate & Execute AI Signal
          </Button>

          {lastSignal && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Latest Signal</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Symbol: <strong>{lastSignal.symbol}</strong></div>
                <div>Side: <strong className={lastSignal.side === 'buy' ? 'text-green-600' : 'text-red-600'}>{lastSignal.side.toUpperCase()}</strong></div>
                <div>Quantity: <strong>{lastSignal.qty}</strong></div>
                <div>Confidence: <strong>{(lastSignal.confidence * 100).toFixed(1)}%</strong></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {executionHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No executions yet</p>
            ) : (
              executionHistory.map((execution, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={execution.success ? 'default' : 'destructive'}>
                      {execution.success ? 'Success' : 'Failed'}
                    </Badge>
                    <span className="text-sm">
                      {execution.signal.symbol} {execution.signal.side.toUpperCase()} {execution.signal.qty}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{execution.broker}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}