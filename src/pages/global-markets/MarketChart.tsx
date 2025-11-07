import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketChartProps {
  indices: Array<{
    name: string;
    change: number | null;
  }>;
}

export function MarketChart({ indices }: MarketChartProps) {
  const data = indices
    .filter(i => i.change !== null)
    .map(i => ({
      name: i.name,
      Market: i.change,
      AI: i.change ? (i.change * 1.2 + (Math.random() - 0.5) * 0.5) : 0 // Mock AI alpha
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI vs Market Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            Loading market data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 AI vs Market Performance
        </CardTitle>
        <p className="text-sm text-gray-500">
          Comparing AI strategy performance against global market indices
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(val: number, name: string) => [
                `${val.toFixed(2)}%`, 
                name === 'Market' ? 'Market Return' : 'AI Strategy'
              ]}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Market" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Market"
            />
            <Line 
              type="monotone" 
              dataKey="AI" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="AI Strategy"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Market Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>AI Strategy Performance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}