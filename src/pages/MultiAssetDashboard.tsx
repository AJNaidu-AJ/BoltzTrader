import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetTypeFilter } from '@/components/filters/AssetTypeFilter';
import { MultiAssetChart } from '@/components/charts/MultiAssetChart';
import { LiveMarketData } from '@/components/realtime/LiveMarketData';
import { MultiAssetSignalTable } from '@/components/tables/MultiAssetSignalTable';
import { useSignals, useSymbols, useMarketData } from '@/hooks/useSignals';
import { useRealtimeSignals } from '@/hooks/useRealtime';

export const MultiAssetDashboard = () => {
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  
  // Enable real-time updates
  useRealtimeSignals();
  
  // Fetch symbols and signals
  const { data: symbols } = useSymbols(selectedAssetType || undefined);
  const { data: signals } = useSignals({ 
    assetType: selectedAssetType || undefined,
    limit: 20 
  });
  
  // Get market data for symbols
  const symbolList = symbols?.data?.map(s => s.symbol) || [];
  const { data: marketData } = useMarketData(symbolList.slice(0, 10)); // Limit to 10 for demo

  // Mock chart data
  const chartData = marketData?.map(item => ({
    timestamp: item.timestamp,
    price: item.price,
    symbol: item.symbol,
    assetType: item.assetType
  })) || [];

  const getAssetTypeStats = () => {
    if (!signals?.data) return { total: 0, byType: {} };
    
    const byType = signals.data.reduce((acc, signal) => {
      const type = signal.asset_type || 'equity';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: signals.data.length,
      byType
    };
  };

  const stats = getAssetTypeStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Multi-Asset Trading Dashboard</h1>
        <div className="flex gap-2">
          {Object.entries(stats.byType).map(([type, count]) => (
            <Card key={type} className="px-4 py-2">
              <div className="text-sm text-muted-foreground">{type.toUpperCase()}</div>
              <div className="text-2xl font-bold">{count}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Asset Type Filter */}
        <div className="lg:col-span-1">
          <AssetTypeFilter
            selectedType={selectedAssetType}
            onTypeChange={setSelectedAssetType}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Multi-Asset Chart */}
          <MultiAssetChart 
            data={chartData}
            selectedAssetType={selectedAssetType || undefined}
          />

          {/* Live Market Data */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Live Market Data
              {selectedAssetType && ` - ${selectedAssetType.toUpperCase()}`}
            </h2>
            <LiveMarketData 
              symbols={symbolList.slice(0, 6)}
              assetType={selectedAssetType || undefined}
            />
          </div>

          {/* Enhanced Signals Table */}
          <MultiAssetSignalTable 
            signals={signals?.data?.slice(0, 10) || []}
            onSignalClick={(signal) => console.log('Signal clicked:', signal)}
          />
        </div>
      </div>
    </div>
  );
};