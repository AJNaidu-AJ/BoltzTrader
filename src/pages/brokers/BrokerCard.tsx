import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Shield } from 'lucide-react';

interface BrokerCardProps {
  broker: {
    id: string;
    broker_name: string;
    created_at: string;
    api_key: string;
  };
  onDisconnect: () => void;
}

export function BrokerCard({ broker, onDisconnect }: BrokerCardProps) {
  const getBrokerIcon = (name: string) => {
    switch (name) {
      case 'ZERODHA': return '🇮🇳';
      case 'BINANCE': return '🌍';
      case 'ALPACA': return '🇺🇸';
      default: return '🔗';
    }
  };

  const getBrokerRegion = (name: string) => {
    switch (name) {
      case 'ZERODHA': return 'India';
      case 'BINANCE': return 'Global';
      case 'ALPACA': return 'United States';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getBrokerIcon(broker.broker_name)}</div>
            <div>
              <h4 className="font-semibold text-lg">{broker.broker_name}</h4>
              <p className="text-sm text-gray-500">{getBrokerRegion(broker.broker_name)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Encrypted
          </Badge>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-500">
            Connected: {new Date(broker.created_at).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            API Key: {broker.api_key ? `${broker.api_key.substring(0, 8)}...` : 'Hidden'}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDisconnect}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}