import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { brokerService, Trade } from '@/services/brokerApi';
import { executionService } from '@/services/executionApi';
import { PnLSummary } from '@/components/trading/PnLSummary';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function TradingHistory() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTrades = await brokerService.getUserTrades(user.id);
      setTrades(userTrades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
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
        <div className="md:col-span-1">
          <PnLSummary />
        </div>
        <div className="md:col-span-2">
          {/* Placeholder for additional metrics */}
        </div>
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
                        {trade.signals && (
                          <div className="text-sm text-muted-foreground">
                            {trade.signals.company_name}
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