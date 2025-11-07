import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

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
      company_name: 'Apple Inc.'
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
      company_name: 'Microsoft Corporation'
    }
  ]);
  const [loading] = useState(false);
  const [error] = useState('');

  const loadTrades = () => {
    // Mock refresh functionality
    console.log('Refreshing trades...');
  };

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
        <Button onClick={loadTrades}>Refresh</Button>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* PnL Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$1,247.50</div>
            <div className="text-sm text-muted-foreground">+2.34%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trades.length}</div>
            <div className="text-sm text-muted-foreground">This session</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.5%</div>
            <div className="text-sm text-muted-foreground">Success rate</div>
          </CardContent>
        </Card>
      </div>

      {trades.length === 0 ? (
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
            <CardTitle>Recent Trades ({trades.length})</CardTitle>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
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
                          {trade.broker}
                        </Badge>
                        {trade.is_paper_trade && (
                          <Badge variant="secondary" className="text-xs">
                            Paper
                          </Badge>
                        )}
                      </div>
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
    </div>
  );
}