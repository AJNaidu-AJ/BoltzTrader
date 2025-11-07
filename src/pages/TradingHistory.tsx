import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Zap, DollarSign, Target, BarChart3, Filter, Download, RefreshCw } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: string;
  execution_latency_ms?: number;
  broker: string;
  is_paper_trade?: boolean;
  created_at: string;
  company_name?: string;
  pnl?: number;
  fees?: number;
  strategy?: string;
}

export default function TradingHistory() {
  const [trades] = useState<Trade[]>([
    {
      id: '1',
      symbol: 'AAPL',
      side: 'buy',
      quantity: 100,
      price: 178.45,
      status: 'filled',
      execution_latency_ms: 45.2,
      broker: 'alpaca',
      is_paper_trade: true,
      created_at: new Date().toISOString(),
      company_name: 'Apple Inc.',
      pnl: 247.50,
      fees: 1.25,
      strategy: 'AI Momentum'
    },
    {
      id: '2',
      symbol: 'MSFT',
      side: 'sell',
      quantity: 50,
      price: 378.92,
      status: 'filled',
      execution_latency_ms: 32.1,
      broker: 'zerodha',
      is_paper_trade: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      company_name: 'Microsoft Corporation',
      pnl: 1000.00,
      fees: 2.50,
      strategy: 'Mean Reversion'
    },
    {
      id: '3',
      symbol: 'GOOGL',
      side: 'buy',
      quantity: 25,
      price: 142.68,
      status: 'pending',
      execution_latency_ms: 28.7,
      broker: 'interactive_brokers',
      is_paper_trade: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      company_name: 'Alphabet Inc.',
      pnl: 0,
      fees: 0,
      strategy: 'Breakout'
    },
    {
      id: '4',
      symbol: 'NVDA',
      side: 'sell',
      quantity: 75,
      price: 489.33,
      status: 'filled',
      execution_latency_ms: 51.8,
      broker: 'alpaca',
      is_paper_trade: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      company_name: 'NVIDIA Corporation',
      pnl: -125.75,
      fees: 1.75,
      strategy: 'AI Momentum'
    },
    {
      id: '5',
      symbol: 'TSLA',
      side: 'buy',
      quantity: 30,
      price: 248.90,
      status: 'cancelled',
      broker: 'zerodha',
      is_paper_trade: false,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      company_name: 'Tesla Inc.',
      pnl: 0,
      fees: 0,
      strategy: 'Scalping'
    }
  ]);
  
  const [loading] = useState(false);
  const [error] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBroker, setFilterBroker] = useState('all');

  const loadTrades = () => {
    console.log('Refreshing trades...');
  };

  // Calculate summary metrics
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalFees = trades.reduce((sum, trade) => sum + (trade.fees || 0), 0);
  const filledTrades = trades.filter(t => t.status === 'filled');
  const winningTrades = filledTrades.filter(t => (t.pnl || 0) > 0);
  const winRate = filledTrades.length > 0 ? (winningTrades.length / filledTrades.length) * 100 : 0;
  const avgLatency = trades.filter(t => t.execution_latency_ms).reduce((sum, t) => sum + (t.execution_latency_ms || 0), 0) / trades.filter(t => t.execution_latency_ms).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      filled: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSideIcon = (side: string) => {
    return side === 'buy' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const PnLChart = () => (
    <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">P&L Over Time</h3>
        <div className="text-sm text-gray-500">Last 7 days</div>
      </div>
      <div className="h-full relative">
        <svg className="w-full h-full" viewBox="0 0 400 150">
          <defs>
            <linearGradient id="pnlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid */}
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" y1={i * 37.5} x2="400" y2={i * 37.5} stroke="#e5e7eb" strokeWidth="1" />
          ))}
          {/* P&L Line */}
          <path
            d={`M 0 75 ${Array.from({length: 7}, (_, i) => 
              `L ${i * 57} ${75 + Math.sin(i * 0.5) * 20 + (i * 3)}`
            ).join(' ')}`}
            fill="url(#pnlGradient)"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );

  const filteredTrades = trades.filter(trade => {
    const symbolMatch = !filterSymbol || trade.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    const statusMatch = filterStatus === 'all' || trade.status === filterStatus;
    const brokerMatch = filterBroker === 'all' || trade.broker === filterBroker;
    return symbolMatch && statusMatch && brokerMatch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading History</h1>
          <p className="text-muted-foreground">View your trading activity and performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadTrades} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {((totalPnL / 50000) * 100).toFixed(2)}% return
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{trades.length}</div>
                <div className="text-sm text-muted-foreground">
                  {filledTrades.length} filled
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">
                  {winningTrades.length}/{filledTrades.length} wins
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{avgLatency.toFixed(1)}ms</div>
                <div className="text-sm text-muted-foreground">
                  Execution speed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="trades" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trades">All Trades</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <Input 
                  placeholder="Filter by symbol..." 
                  value={filterSymbol}
                  onChange={(e) => setFilterSymbol(e.target.value)}
                  className="w-48"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBroker} onValueChange={setFilterBroker}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brokers</SelectItem>
                    <SelectItem value="alpaca">Alpaca</SelectItem>
                    <SelectItem value="zerodha">Zerodha</SelectItem>
                    <SelectItem value="interactive_brokers">Interactive Brokers</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trades Table */}
          {filteredTrades.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No trades found. Start trading to see your history here.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades ({filteredTrades.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{trade.symbol}</div>
                            {trade.company_name && (
                              <div className="text-sm text-muted-foreground">
                                {trade.company_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSideIcon(trade.side)}
                            <span className="capitalize">{trade.side}</span>
                          </div>
                        </TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell>${trade.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(trade.quantity * trade.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(trade.status)}
                            {getStatusBadge(trade.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {trade.execution_latency_ms ? (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-blue-500" />
                              <span className="text-sm">{trade.execution_latency_ms.toFixed(1)}ms</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {trade.broker.replace('_', ' ')}
                            </Badge>
                            {trade.is_paper_trade && (
                              <Badge variant="secondary" className="text-xs">
                                Paper
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {trade.strategy}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(trade.created_at).toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {new Date(trade.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>P&L Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <PnLChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Fees Paid:</span>
                  <span className="font-medium">${totalFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Trade:</span>
                  <span className="font-medium text-green-600">+$1,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Trade:</span>
                  <span className="font-medium text-red-600">-$125.75</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Trade Size:</span>
                  <span className="font-medium">${(trades.reduce((sum, t) => sum + (t.quantity * t.price), 0) / trades.length).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Broker Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['alpaca', 'zerodha', 'interactive_brokers'].map(broker => {
                    const brokerTrades = trades.filter(t => t.broker === broker);
                    const brokerPnL = brokerTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                    return (
                      <div key={broker} className="flex justify-between items-center">
                        <span className="capitalize">{broker.replace('_', ' ')}</span>
                        <div className="text-right">
                          <div className={`font-medium ${brokerPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {brokerPnL >= 0 ? '+' : ''}${brokerPnL.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">{brokerTrades.length} trades</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['AI Momentum', 'Mean Reversion', 'Breakout', 'Scalping'].map(strategy => {
                    const strategyTrades = trades.filter(t => t.strategy === strategy);
                    const strategyPnL = strategyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                    return (
                      <div key={strategy} className="flex justify-between items-center">
                        <span>{strategy}</span>
                        <div className="text-right">
                          <div className={`font-medium ${strategyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {strategyPnL >= 0 ? '+' : ''}${strategyPnL.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">{strategyTrades.length} trades</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}