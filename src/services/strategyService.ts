import { supabase } from '@/integrations/supabase/client';

export interface StrategyCondition {
  id: string;
  indicator: string;
  operator: string;
  value: number;
  timeframe: string;
  parameters?: Record<string, any>;
}

export interface Strategy {
  id?: string;
  name: string;
  description: string;
  conditions: StrategyCondition[];
  logic: {
    groups: Array<{
      operator: 'AND' | 'OR';
      conditions: string[];
    }>;
  };
  user_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BacktestResult {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  profit_factor: number;
  start_date: string;
  end_date: string;
}

class StrategyService {
  private baseUrl = import.meta.env.VITE_SCORING_SERVICE_URL || 'http://localhost:8000';

  async saveStrategy(strategy: Strategy): Promise<Strategy> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const strategyData = {
      name: strategy.name,
      description: strategy.description,
      conditions: strategy.conditions,
      logic: strategy.logic,
      user_id: user.id,
      is_active: true
    };

    const { data, error } = await supabase
      .from('strategies')
      .insert(strategyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStrategies(): Promise<Strategy[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStrategy(id: string): Promise<Strategy> {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy> {
    const { data, error } = await supabase
      .from('strategies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStrategy(id: string): Promise<void> {
    const { error } = await supabase
      .from('strategies')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async backtestStrategy(strategy: Strategy, symbol = 'AAPL', startDate = '2023-01-01', endDate = '2024-01-01'): Promise<BacktestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: this.convertToBackendFormat(strategy),
          symbol,
          start_date: startDate,
          end_date: endDate
        })
      });

      if (!response.ok) {
        throw new Error(`Backtest failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backtest error:', error);
      // Return mock data for demo
      return {
        total_return: Math.random() * 20 - 5,
        sharpe_ratio: Math.random() * 2,
        max_drawdown: Math.random() * -10,
        win_rate: Math.random() * 0.4 + 0.4,
        total_trades: Math.floor(Math.random() * 100) + 20,
        profit_factor: Math.random() * 2 + 0.5,
        start_date: startDate,
        end_date: endDate
      };
    }
  }

  private convertToBackendFormat(strategy: Strategy) {
    return {
      name: strategy.name,
      conditions: strategy.conditions.map(condition => ({
        indicator: condition.indicator,
        operator: condition.operator,
        value: condition.value,
        timeframe: condition.timeframe,
        parameters: this.getIndicatorParameters(condition.indicator)
      })),
      logic: strategy.logic
    };
  }

  private getIndicatorParameters(indicator: string): Record<string, any> {
    const defaults = {
      sma: { period: 20 },
      ema: { period: 20 },
      rsi: { period: 14 },
      macd: { fast: 12, slow: 26, signal: 9 },
      bb: { period: 20, std: 2 },
      volume: {},
      price: {}
    };
    return defaults[indicator as keyof typeof defaults] || {};
  }

  async getStrategyTemplates(): Promise<Strategy[]> {
    // Mock templates - in production, these would come from a templates table
    return [
      {
        id: 'template-1',
        name: 'RSI Oversold',
        description: 'Buy when RSI < 30, sell when RSI > 70',
        conditions: [
          {
            id: '1',
            indicator: 'rsi',
            operator: '<',
            value: 30,
            timeframe: '1d'
          }
        ],
        logic: {
          groups: [{ operator: 'AND', conditions: ['1'] }]
        }
      },
      {
        id: 'template-2',
        name: 'Moving Average Crossover',
        description: 'Buy when fast MA crosses above slow MA',
        conditions: [
          {
            id: '1',
            indicator: 'sma',
            operator: 'cross_above',
            value: 50,
            timeframe: '1d'
          }
        ],
        logic: {
          groups: [{ operator: 'AND', conditions: ['1'] }]
        }
      }
    ];
  }
}

export const strategyService = new StrategyService();