import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { mobileService } from '@/services/mobileService';
import { WifiOff, Wifi, Clock } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const unsubscribe = mobileService.onNetworkChange((online) => {
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineAlert(true);
      } else {
        setTimeout(() => setShowOfflineAlert(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showOfflineAlert && isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2">
      {!isOnline ? (
        <Alert className="bg-red-50 border-red-200">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>You're offline. Showing cached data.</span>
              <Badge variant="outline" className="text-red-600 border-red-300">
                <Clock className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>Connection restored. Syncing data...</span>
              <Badge variant="outline" className="text-green-600 border-green-300">
                Online
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};