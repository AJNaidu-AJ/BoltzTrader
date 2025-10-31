import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backtestService } from '@/services/backtestApi';
import { Download, FileText, History } from 'lucide-react';

export const BacktestHistory = () => {
  const [backtests, setBacktests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBacktests();
  }, []);

  const loadBacktests = async () => {
    try {
      const data = await backtestService.listBacktests();
      setBacktests(data);
    } catch (error) {
      console.error('Failed to load backtests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getReturnColor = (returnValue: number) => {
    return returnValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return <div>Loading backtest history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Backtest History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {backtests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No backtests found. Run your first backtest to see results here.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Sharpe</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backtests.map((backtest) => (
                <TableRow key={backtest.id}>
                  <TableCell className="font-medium">
                    {backtest.symbol}
                  </TableCell>
                  <TableCell>
                    {backtest.period_days} days
                  </TableCell>
                  <TableCell>
                    <span className={getReturnColor(backtest.metrics.total_return)}>
                      {backtest.metrics.total_return}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {backtest.metrics.accuracy}%
                  </TableCell>
                  <TableCell>
                    {backtest.metrics.sharpe_ratio}
                  </TableCell>
                  <TableCell>
                    {formatDate(backtest.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {backtest.pdf_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(backtest.pdf_url, '_blank')}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      {backtest.csv_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(backtest.csv_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};