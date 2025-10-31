import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { executionService, PnLSummary as PnLData } from '@/services/executionApi';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';

interface PnLSummaryProps {
  symbol?: string;
}

export const PnLSummary = ({ symbol }: PnLSummaryProps) => {
  const { user } = useAuth();
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadPnLData();
    }
  }, [user, symbol]);

  const loadPnLData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await executionService.getUserPnL(user.id, symbol);
      setPnlData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PnL data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600';
    if (pnl < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPnLIcon = (pnl: number) => {
    if (pnl > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (pnl < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <DollarSign className="h-4 w-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!pnlData) return null;

  const totalPositions = Object.keys(pnlData.positions).length;
  const activePositions = Object.values(pnlData.positions).filter(pos => pos.quantity > 0).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {symbol ? `${symbol} PnL` : 'Portfolio PnL'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadPnLData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total PnL */}
        <div className="text-center p-4 border rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getPnLIcon(pnlData.total_pnl)}
            <span className="text-sm font-medium text-muted-foreground">Total PnL</span>
          </div>
          <div className={`text-2xl font-bold ${getPnLColor(pnlData.total_pnl)}`}>
            {formatCurrency(pnlData.total_pnl)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {pnlData.total_pnl >= 0 ? 'Profit' : 'Loss'}
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold">{activePositions}</div>
            <div className="text-sm text-muted-foreground">Active Positions</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold">{totalPositions}</div>
            <div className="text-sm text-muted-foreground">Total Symbols</div>
          </div>
        </div>

        {/* Position Details */}
        {Object.keys(pnlData.positions).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Positions</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(pnlData.positions).map(([symbol, position]) => (
                <div key={symbol} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.quantity} shares @ {formatCurrency(position.avg_cost)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(position.total_cost)}
                    </div>
                    <Badge variant={position.quantity > 0 ? 'default' : 'secondary'}>
                      {position.quantity > 0 ? 'Long' : 'Closed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(pnlData.calculated_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};