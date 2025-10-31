interface BacktestRequest {
  symbol: string;
  timeframe?: string;
  periodDays: number;
}

interface BacktestResponse {
  task_id: string;
  status: string;
  message: string;
}

interface BacktestStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: {
    symbol: string;
    metrics: {
      total_return: number;
      accuracy: number;
      sharpe_ratio: number;
      max_drawdown: number;
      total_trades: number;
      win_rate: number;
    };
    pdf_url: string;
    csv_url: string;
  };
  error?: string;
}

class BacktestService {
  private baseUrl = 'http://localhost:8000/api';

  async startBacktest(request: BacktestRequest): Promise<BacktestResponse> {
    const response = await fetch(`${this.baseUrl}/backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: request.symbol,
        timeframe: request.timeframe || '1d',
        period_days: request.periodDays
      })
    });

    if (!response.ok) {
      throw new Error(`Backtest failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getBacktestStatus(taskId: string): Promise<BacktestStatus> {
    const response = await fetch(`${this.baseUrl}/backtest/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return await response.json();
  }

  async listBacktests(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/backtests`);
    
    if (!response.ok) {
      throw new Error(`Failed to list backtests: ${response.statusText}`);
    }

    const data = await response.json();
    return data.backtests || [];
  }

  pollBacktestStatus(taskId: string, onUpdate: (status: BacktestStatus) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const status = await this.getBacktestStatus(taskId);
        onUpdate(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }
}

export const backtestService = new BacktestService();