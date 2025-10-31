import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { globalMarketService, MarketRegion, GlobalMarketData } from '@/services/globalMarketService';
import { localizationService } from '@/services/localizationService';
import { Globe, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const GlobalMarketDashboard = () => {
  const [regions, setRegions] = useState<MarketRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('us');
  const [marketData, setMarketData] = useState<GlobalMarketData[]>([]);
  const [globalIndices, setGlobalIndices] = useState<GlobalMarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegions();
    loadGlobalIndices();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      loadMarketData(selectedRegion);
    }
  }, [selectedRegion]);

  const loadRegions = async () => {
    try {
      const data = await globalMarketService.getRegions();
      setRegions(data);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const loadMarketData = async (region: string) => {
    try {
      setLoading(true);
      const data = await globalMarketService.getMarketData(region);
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalIndices = async () => {
    try {
      const data = await globalMarketService.getGlobalIndices();
      setGlobalIndices(data);
    } catch (error) {
      console.error('Error loading global indices:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return localizationService.formatCurrency(price, currency);
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
        <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </div>
    );
  };

  const getMarketStatus = (region: string) => {
    const isOpen = globalMarketService.isMarketOpen(region);
    return (
      <Badge variant={isOpen ? 'default' : 'secondary'}>
        <Clock className="h-3 w-3 mr-1" />
        {isOpen ? 'Open' : 'Closed'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {globalIndices.map((index) => (
              <div key={index.symbol} className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{index.symbol}</h4>
                  {getMarketStatus(index.region)}
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {formatPrice(index.price, index.currency)}
                  </div>
                  {formatChange(index.change, index.changePercent)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regional Markets</CardTitle>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.map((stock) => (
                <Card key={stock.symbol} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{stock.symbol}</h4>
                      <Badge variant="outline" className="text-xs">
                        {stock.exchange}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">
                        {formatPrice(stock.price, stock.currency)}
                      </div>
                      {formatChange(stock.change, stock.changePercent)}
                      <div className="text-xs text-muted-foreground">
                        Vol: {localizationService.formatNumber(stock.volume)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};