import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChartData {
  timestamp: number;
  price: number;
  symbol: string;
  assetType: 'equity' | 'crypto' | 'etf';
}

interface MultiAssetChartProps {
  data: ChartData[];
  selectedAssetType?: string;
}

export const MultiAssetChart = ({ data, selectedAssetType }: MultiAssetChartProps) => {
  const chartData = useMemo(() => {
    const filtered = selectedAssetType 
      ? data.filter(d => d.assetType === selectedAssetType)
      : data;

    // Group by timestamp and create combined data points
    const grouped = filtered.reduce((acc, item) => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      if (!acc[time]) {
        acc[time] = { time, timestamp: item.timestamp };
      }
      acc[time][item.symbol] = item.price;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [data, selectedAssetType]);

  const symbols = useMemo(() => {
    const filtered = selectedAssetType 
      ? data.filter(d => d.assetType === selectedAssetType)
      : data;
    return [...new Set(filtered.map(d => d.symbol))];
  }, [data, selectedAssetType]);

  const getLineColor = (symbol: string, index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    return colors[index % colors.length];
  };

  const isCrypto = selectedAssetType === 'crypto';
  const title = selectedAssetType 
    ? `${selectedAssetType.toUpperCase()} Price Chart${isCrypto ? ' (24/7)' : ''}`
    : 'Multi-Asset Price Chart';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {isCrypto && (
            <Badge variant="secondary">24/7 Trading</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: number, name: string) => [
                `$${value?.toFixed(2)}`, 
                name
              ]}
            />
            {symbols.map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={getLineColor(symbol, index)}
                strokeWidth={2}
                dot={false}
                connectNulls={isCrypto} // Connect gaps for crypto (24/7 trading)
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {symbols.map((symbol, index) => (
            <Badge key={symbol} variant="outline" className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getLineColor(symbol, index) }}
              />
              {symbol}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};