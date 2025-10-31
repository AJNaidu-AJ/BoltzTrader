import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { backtestService } from '@/services/backtestApi';
import { Play, Download, FileText, BarChart3, Loader2 } from 'lucide-react';

interface BacktestRunnerProps {
  symbol?: string;
}

export const BacktestRunner = ({ symbol: initialSymbol }: BacktestRunnerProps) => {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [periodDays, setPeriodDays] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    setStatus('Starting backtest...');
    setError('');
    setResult(null);

    try {
      // Start backtest
      const response = await backtestService.startBacktest({
        symbol,
        periodDays
      });

      // Poll for status updates
      const stopPolling = backtestService.pollBacktestStatus(response.task_id, (statusUpdate) => {
        setStatus(statusUpdate.status);
        
        if (statusUpdate.status === 'running') {
          setProgress(50);
        } else if (statusUpdate.status === 'completed') {
          setProgress(100);
          setResult(statusUpdate.result);
          setIsRunning(false);
        } else if (statusUpdate.status === 'failed') {
          setError(statusUpdate.error || 'Backtest failed');
          setIsRunning(false);
        }
      });

      // Cleanup polling on unmount
      return stopPolling;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Backtest Runner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              disabled={isRunning}
            />
          </div>
          <div>
            <Label htmlFor="period">Period (Days)</Label>
            <Input
              id="period"
              type="number"
              value={periodDays}
              onChange={(e) => setPeriodDays(parseInt(e.target.value))}
              min="1"
              max="365"
              disabled={isRunning}
            />
          </div>
        </div>

        {/* Run Button */}
        <Button 
          onClick={handleRunBacktest} 
          disabled={isRunning || !symbol}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Backtest...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Backtest
            </>
          )}
        </Button>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <h3 className="font-semibold">Backtest Results</h3>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-green-600">
                  {result.metrics.total_return}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">
                  {result.metrics.accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">
                  {result.metrics.sharpe_ratio}
                </div>
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-red-600">
                  {result.metrics.max_drawdown}%
                </div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open(result.pdf_url, '_blank')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(result.csv_url, '_blank')}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};