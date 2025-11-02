import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { strategyApi, StrategyResponse } from '@/services/strategyApi';
import { Brain, TrendingUp, Activity, Target } from 'lucide-react';

const StrategyLibrary: React.FC = () => {
  const [strategies, setStrategies] = useState<any>({});
  const [topStrategies, setTopStrategies] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<StrategyResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStrategies();
    loadTopStrategies();
  }, []);

  const loadStrategies = async () => {
    const data = await strategyApi.getStrategies();
    setStrategies(data);
  };

  const loadTopStrategies = async () => {
    const data = await strategyApi.getTopStrategies(3);
    setTopStrategies(data);
  };

  const testStrategies = async () => {
    setLoading(true);
    try {
      const result = await strategyApi.evaluateStrategies({
        symbol: 'AAPL',
        market_data: { price: 150, volume: 1000000, high: 152, low: 148 },
        indicators: { rsi: 65, ema_20: 148, bollinger_upper: 155, bollinger_lower: 145 },
        sentiment: 0.3,
        breakouts: ['MOMENTUM_BREAKOUT'],
        fusion_method: 'weighted_average'
      });
      setTestResult(result);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Strategy Library
          </h1>
          <p className="text-muted-foreground mt-2">
            Modular AI trading strategies with dynamic fusion
          </p>
        </div>
        <Button onClick={testStrategies} disabled={loading}>
          {loading ? 'Testing...' : 'Test Strategies'}
        </Button>
      </div>

      {/* Strategy Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.stats?.total_strategies || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{strategies.stats?.enabled_strategies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.stats?.total_trades || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {((strategies.stats?.avg_win_rate || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Strategy Fusion Result - {testResult.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Fused Signal</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(testResult.fused_signal.action)}>
                      {testResult.fused_signal.action}
                    </Badge>
                    <span className="text-sm">
                      Confidence: {(testResult.fused_signal.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Risk: {testResult.fused_signal.risk_level}
                  </div>
                  <div className="text-sm">
                    {testResult.fused_signal.reasoning.slice(0, 2).map((reason, i) => (
                      <div key={i}>• {reason}</div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Individual Signals</h4>
                <div className="space-y-1">
                  {testResult.individual_signals.map((signal, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{signal.strategy_id}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getActionColor(signal.action)}>
                          {signal.action}
                        </Badge>
                        <span>{(signal.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {topStrategies.map((strategy, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{strategy.name}</h4>
                  <Badge variant={strategy.enabled ? 'default' : 'secondary'}>
                    {strategy.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <div className="font-semibold">{(strategy.metrics.win_rate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trades:</span>
                    <div className="font-semibold">{strategy.metrics.total_trades}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Available Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(strategies.strategies || {}).map(([id, strategy]: [string, any]) => (
              <div key={id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{strategy.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={strategy.enabled ? 'default' : 'secondary'}>
                      {strategy.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Weight: {strategy.weight.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <div className="font-semibold">{(strategy.metrics.win_rate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trades:</span>
                    <div className="font-semibold">{strategy.metrics.total_trades}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Return:</span>
                    <div className="font-semibold">{strategy.metrics.avg_return.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyLibrary;