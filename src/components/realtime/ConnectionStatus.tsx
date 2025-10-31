import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { realtimeService } from '@/services/realtime';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(realtimeService.getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return { icon: Wifi, color: 'bg-green-500', text: 'Connected' };
      case 'reconnecting':
        return { icon: RotateCcw, color: 'bg-yellow-500', text: 'Reconnecting' };
      default:
        return { icon: WifiOff, color: 'bg-red-500', text: 'Disconnected' };
    }
  };

  const { icon: Icon, color, text } = getStatusConfig();

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
};