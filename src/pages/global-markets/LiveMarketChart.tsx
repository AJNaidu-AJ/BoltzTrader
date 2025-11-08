import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Wifi, WifiOff } from 'lucide-react';
import { startMarketStreaming, stopMarketStreaming, getStreamStatus } from '@/services/streaming/marketSocketService';
import { applyAISignalOverlay } from '@/services/streaming/aiSignalOverlay';
import { useMarketStore } from '@/store/marketStore';
import { useAISignalExecutor } from '@/hooks/useAISignalExecutor';

interface LiveMarketChartProps {
  symbol: string;
  title?: string;
}

export function LiveMarketChart({ symbol, title }: LiveMarketChartProps) {
  const { marketData, streamStatus } = useMarketStore();
  const { executeAISignal, isExecuting } = useAISignalExecutor();
  const [isStreaming, setIsStreaming] = useState(false);
  
  const data = marketData[symbol];
  const aiSignal = applyAISignalOverlay(symbol);

  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopMarketStreaming();
      }
    };
  }, [isStreaming]);

  const handleToggleStream = () => {
    if (isStreaming) {
      stopMarketStreaming();
      setIsStreaming(false);
    } else {
      startMarketStreaming([symbol]);
      setIsStreaming(true);
    }
  };

  const getSignalColor = (status: string) => {
    switch (status) {
      case 'BUY': return 'bg-green-100 text-green-700 border-green-200';
      case 'SELL': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return price > 1000 ? price.toLocaleString() : price.toFixed(2);
  };

  const chartData = data?.history?.slice(-50) || []; // Last 50 points

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              {streamStatus === 'CONNECTED' ? 
                <Wifi className="h-4 w-4 text-green-600" /> : 
                <WifiOff className="h-4 w-4 text-gray-400" />
              }
              {title || symbol} — Live Market Feed
            </CardTitle>
            
            {aiSignal && (
              <Badge className={`${getSignalColor(aiSignal.status)} border`}>
                AI: {aiSignal.status} ({(aiSignal.confidence * 100).toFixed(0)}%)
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={streamStatus === 'CONNECTED' ? 'default' : 'secondary'}>
              {streamStatus}
            </Badge>
            
            <Button
              onClick={handleToggleStream}
              size="sm"
              variant={isStreaming ? 'destructive' : 'default'}
            >
              {isStreaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isStreaming ? 'Stop' : 'Start'} Stream
            </Button>
            
            {aiSignal && (
              <Button
                onClick={() => executeAISignal({
                  symbol,
                  status: aiSignal.status as 'BUY' | 'SELL',
                  amount: 100,
                  confidence: aiSignal.confidence,
                  timestamp: new Date(),
                  reasoning: `AI Signal: ${aiSignal.status} with ${(aiSignal.confidence * 100).toFixed(1)}% confidence`
                })}
                disabled={isExecuting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isExecuting ? 'Executing...' : 'Execute Trade'}
              </Button>
            )}
          </div>
        </div>
        
        {data && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Price: <strong>${formatPrice(data.price)}</strong></span>
            <span className={data.change >= 0 ? 'text-green-600' : 'text-red-600'}>
              Change: <strong>{data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%</strong>
            </span>
            <span>Volume: <strong>{data.volume.toLocaleString()}</strong></span>
            <span>Updated: <strong>{new Date(data.timestamp).toLocaleTimeString()}</strong></span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `$${formatPrice(value)}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
                labelFormatter={(time) => new Date(time).toLocaleString()}
              />
              
              {/* AI Signal Reference Lines */}
              {aiSignal && aiSignal.status === 'BUY' && (
                <ReferenceLine y={aiSignal.price} stroke="#10b981" strokeDasharray="5 5" />
              )}
              {aiSignal && aiSignal.status === 'SELL' && (
                <ReferenceLine y={aiSignal.price} stroke="#ef4444" strokeDasharray="5 5" />
              )}
              
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            {isStreaming ? 'Waiting for market data...' : 'Start streaming to see live data'}
          </div>
        )}
        
        {aiSignal && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Latest AI Signal:</span>
              <div className="flex items-center gap-2">
                <Badge className={getSignalColor(aiSignal.status)}>
                  {aiSignal.status}
                </Badge>
                <span className="text-gray-600">
                  Confidence: {(aiSignal.confidence * 100).toFixed(1)}%
                </span>
                <span className="text-gray-600">
                  {new Date(aiSignal.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}