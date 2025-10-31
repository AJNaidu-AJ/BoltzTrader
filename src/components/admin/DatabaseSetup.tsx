import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setupDatabase } from '@/utils/setupDatabase';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const DatabaseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSetup = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await setupDatabase();
      
      if (response.success) {
        setResult({
          success: true,
          message: 'Database setup completed successfully! Sample data has been inserted.'
        });
      } else {
        setResult({
          success: false,
          message: `Setup failed: ${response.error}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Setup failed: ${error}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Initialize your database with sample symbols and signals for testing.
        </p>

        <Button 
          onClick={handleSetup} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Setup Database
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>This will create:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>6 sample symbols (AAPL, BTC-USD, SPY, etc.)</li>
            <li>3 sample signals with different asset types</li>
            <li>Required database structure</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};