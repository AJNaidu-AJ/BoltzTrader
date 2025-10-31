import { BacktestRunner } from '@/components/backtest/BacktestRunner';
import { BacktestHistory } from '@/components/backtest/BacktestHistory';

export const BacktestPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backtest & Audit Reports</h1>
        <p className="text-muted-foreground">
          Run backtests on trading signals and generate detailed performance reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BacktestRunner />
        <div className="space-y-6">
          <BacktestHistory />
        </div>
      </div>
    </div>
  );
};