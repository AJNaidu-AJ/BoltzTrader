import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function SignalOverlayLegend() {
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h4 className="font-medium text-sm mb-3">AI Signal Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span>BUY Signal</span>
            <Badge variant="secondary" className="text-xs">Strong Uptrend</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <TrendingDown className="h-3 w-3 text-red-600" />
            <span>SELL Signal</span>
            <Badge variant="destructive" className="text-xs">Strong Downtrend</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <Minus className="h-3 w-3 text-gray-600" />
            <span>HOLD Signal</span>
            <Badge variant="outline" className="text-xs">Neutral/Sideways</Badge>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>• Signals update in real-time based on price movement and volume analysis</p>
          <p>• Confidence levels range from 0-95% based on market conditions</p>
        </div>
      </CardContent>
    </Card>
  );
}