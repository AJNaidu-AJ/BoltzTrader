import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { checkDatabase } from '@/utils/checkDatabase';
import { Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const DatabaseStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async () => {
    setIsLoading(true);
    const result = await checkDatabase();
    setStatus(result);
    setIsLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (!status) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </div>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symbols Table Status */}
        <div className="flex items-center justify-between">
          <span>Symbols Table</span>
          <div className="flex items-center gap-2">
            {status.symbolsTable?.exists ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="default">{status.symbolsTable.count} records</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="destructive">Not found</Badge>
              </>
            )}
          </div>
        </div>

        {/* Signals Asset Type Status */}
        <div className="flex items-center justify-between">
          <span>Asset Type Column</span>
          <div className="flex items-center gap-2">
            {status.signalsAssetType?.hasAssetType ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="default">Available</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="destructive">Missing</Badge>
              </>
            )}
          </div>
        </div>

        {/* Sample Data */}
        {status.symbolsTable?.data?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Sample Symbols:</h4>
            <div className="space-y-1">
              {status.symbolsTable.data.slice(0, 3).map((symbol: any) => (
                <div key={symbol.id} className="flex items-center justify-between text-sm">
                  <span>{symbol.symbol} - {symbol.name}</span>
                  <Badge variant="outline">{symbol.asset_type}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(status.symbolsTable?.error || status.signalsAssetType?.error) && (
          <div className="text-sm text-red-600">
            {status.symbolsTable?.error || status.signalsAssetType?.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};