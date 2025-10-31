import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { realtimeService } from '@/services/realtime';
import { TrendingUp, TrendingDown, Coins, Building2 } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: number;
  assetType?: 'equity' | 'crypto' | 'etf';
}

export const LiveMarketData = ({ symbols, assetType }: { symbols: string[]; assetType?: string }) => {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToMarketData(symbols, (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    });

    return unsubscribe;
  }, [symbols]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {symbols.map(symbol => {
        const data = marketData[symbol];
        if (!data) return null;

        const isPositive = data.change >= 0;
        const changePercent = ((data.change / data.price) * 100).toFixed(2);
        const getAssetIcon = () => {
          switch (data.assetType) {
            case 'crypto': return Coins;
            case 'etf': return Building2;
            default: return TrendingUp;
          }
        };
        const AssetIcon = getAssetIcon();

        return (
          <Card key={symbol}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AssetIcon className="h-4 w-4" />
                {symbol}
                {data.assetType === 'crypto' && (
                  <Badge variant="secondary" className="text-xs">24/7</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${data.price.toFixed(2)}</span>
                <Badge variant={isPositive ? 'default' : 'destructive'} className="flex items-center gap-1">
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {changePercent}%
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Volume: {data.volume.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};