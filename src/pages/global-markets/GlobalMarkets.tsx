import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Globe, TrendingUp } from 'lucide-react';
import { fetchGlobalIndices, fetchCryptoMarkets, fetchForexMarkets } from '@/services/globalData/globalMarketService';
import { MarketOverviewCard } from './MarketOverviewCard';
import { MarketChart } from './MarketChart';
import { Heatmap } from './Heatmap';
import { LiveMarketChart } from './LiveMarketChart';
import { SignalOverlayLegend } from './SignalOverlayLegend';

export default function GlobalMarkets() {
  const [indices, setIndices] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [forex, setForex] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [indicesData, cryptoData, forexData] = await Promise.all([
        fetchGlobalIndices(),
        fetchCryptoMarkets(),
        fetchForexMarkets()
      ]);
      
      setIndices(indicesData);
      setCrypto(cryptoData);
      setForex(forexData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const allMarkets = [...indices, ...crypto, ...forex];
  const positiveCount = allMarkets.filter(m => m.change && m.change > 0).length;
  const totalCount = allMarkets.filter(m => m.change !== null).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Global Markets Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time global indices, crypto, and AI-enhanced market analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={loadMarketData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Markets</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markets Up</p>
                <p className="text-2xl font-bold text-green-600">{positiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? 'Loading' : 'Live'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Indices */}
      <Card>
        <CardHeader>
          <CardTitle>🏛️ Global Indices</CardTitle>
          <p className="text-sm text-muted-foreground">
            Major stock market indices from around the world
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-5 gap-4">
              {indices.map((index) => (
                <MarketOverviewCard key={index.symbol} data={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cryptocurrency */}
      <Card>
        <CardHeader>
          <CardTitle>₿ Cryptocurrency</CardTitle>
          <p className="text-sm text-muted-foreground">
            Major cryptocurrency pairs and digital assets
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {crypto.map((coin) => (
                <MarketOverviewCard key={coin.symbol} data={coin} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI vs Market Chart */}
      <MarketChart indices={indices} />

      {/* Live Market Streaming */}
      <LiveMarketChart symbol="BTCUSDT" title="Bitcoin" />
      <SignalOverlayLegend />

      {/* Regional Heatmap */}
      <Heatmap data={indices} />
    </div>
  );
}