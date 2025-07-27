import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface OfflineState {
  isOnline: boolean;
  hasUnsyncedData: boolean;
  lastSyncTime: Date | null;
}

export function OfflineIndicator() {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    hasUnsyncedData: false,
    lastSyncTime: null
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: true }));
      // Attempt to sync any pending data
      syncPendingData();
    };

    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingData = async () => {
    // Simulate sync operation
    if (offlineState.hasUnsyncedData) {
      setOfflineState(prev => ({
        ...prev,
        hasUnsyncedData: false,
        lastSyncTime: new Date()
      }));
    }
  };

  if (offlineState.isOnline && !offlineState.hasUnsyncedData) {
    return null; // Don't show indicator when everything is normal
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 border-l-4 border-l-warning">
      <div className="p-3">
        <div className="flex items-start gap-3">
          {offlineState.isOnline ? (
            <Wifi className="h-5 w-5 text-success mt-0.5" />
          ) : (
            <WifiOff className="h-5 w-5 text-warning mt-0.5" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {offlineState.isOnline ? 'Back Online' : 'Offline Mode'}
              </span>
              {offlineState.hasUnsyncedData && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Sync
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {offlineState.isOnline
                ? offlineState.hasUnsyncedData
                  ? 'Syncing your learning progress...'
                  : 'All data synced successfully'
                : 'Your progress is being saved locally'
              }
            </p>
            
            {offlineState.lastSyncTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Last sync: {offlineState.lastSyncTime.toLocaleTimeString()}
              </p>
            )}
          </div>

          {offlineState.isOnline && offlineState.hasUnsyncedData && (
            <Button
              size="sm"
              variant="outline"
              onClick={syncPendingData}
              className="text-xs h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              Sync
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}