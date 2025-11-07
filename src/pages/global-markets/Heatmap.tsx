import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapProps {
  data: Array<{
    name?: string;
    symbol: string;
    change: number | null;
    region?: string;
    flag?: string;
  }>;
}

export function Heatmap({ data }: HeatmapProps) {
  const validData = data.filter(item => item.change !== null);

  const getHeatmapColor = (change: number) => {
    if (change > 2) return 'bg-green-500 text-white';
    if (change > 0.5) return 'bg-green-200 text-green-800';
    if (change > 0) return 'bg-green-100 text-green-700';
    if (change > -0.5) return 'bg-red-100 text-red-700';
    if (change > -2) return 'bg-red-200 text-red-800';
    return 'bg-red-500 text-white';
  };

  const getIntensity = (change: number) => {
    const intensity = Math.min(Math.abs(change) / 3, 1); // Max intensity at 3%
    return intensity;
  };

  if (validData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🌎 Regional Performance Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Loading heatmap data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌎 Regional Performance Heatmap
        </CardTitle>
        <p className="text-sm text-gray-500">
          Global market performance visualization
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {validData.map((item) => (
            <div
              key={item.symbol}
              className={`p-3 rounded-lg text-center transition-all hover:scale-105 ${getHeatmapColor(item.change!)}`}
              style={{
                boxShadow: `0 0 ${getIntensity(item.change!) * 20}px rgba(0,0,0,0.1)`
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {item.flag && <span className="text-sm">{item.flag}</span>}
                <div className="font-medium text-xs">{item.name || item.symbol}</div>
              </div>
              <div className="font-bold text-sm">
                {item.change! > 0 ? '+' : ''}{item.change!.toFixed(2)}%
              </div>
              {item.region && (
                <div className="text-xs opacity-75 mt-1">{item.region}</div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Strong Decline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>Decline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Strong Growth</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}