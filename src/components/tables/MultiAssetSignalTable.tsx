import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Coins, Building2, HelpCircle } from 'lucide-react';
import { SignalExplain } from '@/components/signals/SignalExplain';
import { ASSET_TYPE_CONFIG, getMarketStatus } from '@/utils/assetHelpers';
import type { Tables } from '@/integrations/supabase/types';

interface MultiAssetSignalTableProps {
  signals: Tables<'signals'>[];
  onSignalClick?: (signal: Tables<'signals'>) => void;
}

const SignalExplainButton = ({ signal }: { signal: Tables<'signals'> }) => {
  const [showExplain, setShowExplain] = useState(false);
  
  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setShowExplain(!showExplain)}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      {showExplain && (
        <div className="absolute z-10 mt-2 w-80 p-4 bg-background border rounded-lg shadow-lg">
          <SignalExplain signal={signal} />
        </div>
      )}
    </div>
  );
};

export const MultiAssetSignalTable = ({ signals, onSignalClick }: MultiAssetSignalTableProps) => {
  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'crypto': return Coins;
      case 'etf': return Building2;
      default: return TrendingUp;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'top': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Asset Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => {
              const AssetIcon = getAssetIcon(signal.asset_type || 'equity');
              const marketStatus = getMarketStatus(signal.asset_type as any);
              const assetConfig = ASSET_TYPE_CONFIG[signal.asset_type as keyof typeof ASSET_TYPE_CONFIG];
              
              return (
                <TableRow 
                  key={signal.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSignalClick?.(signal)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AssetIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{signal.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {signal.company_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <div className={`w-2 h-2 rounded-full ${assetConfig?.color}`} />
                      {assetConfig?.label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">
                      ${signal.current_price?.toFixed(2)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className={`flex items-center gap-1 ${getChangeColor(signal.price_change || 0)}`}>
                      {signal.price_change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{signal.price_change_percent?.toFixed(2)}%</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getRankColor(signal.rank || 'low')}>
                      {signal.rank?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm">{signal.confidence}%</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={marketStatus === 'open' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {marketStatus === 'open' ? 'LIVE' : marketStatus.toUpperCase()}
                      </Badge>
                      {signal.asset_type === 'crypto' && (
                        <Badge variant="outline" className="text-xs">24/7</Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <SignalExplainButton signal={signal} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};