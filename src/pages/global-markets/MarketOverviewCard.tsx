import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOverviewCardProps {
  data: {
    name?: string;
    symbol: string;
    price: number | null;
    change: number | null;
    region?: string;
    flag?: string;
  };
}

export function MarketOverviewCard({ data }: MarketOverviewCardProps) {
  const isPositive = data.change && data.change >= 0;
  const priceDisplay = data.price ? 
    (data.price > 1000 ? data.price.toLocaleString() : data.price.toFixed(2)) : 
    '—';

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {data.flag && <span className="text-lg">{data.flag}</span>}
            <h4 className="font-semibold text-sm">{data.name || data.symbol}</h4>
          </div>
          {data.change !== null && (
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            {data.symbol.includes('USD') ? '$' : ''}{priceDisplay}
          </p>
          
          {data.change !== null && (
            <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{data.change.toFixed(2)}%
            </p>
          )}
          
          {data.region && (
            <p className="text-xs text-gray-500">{data.region}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}