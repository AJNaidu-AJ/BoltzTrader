/**
 * Strategy Engine API Client for Phase 2 Strategy Library
 */

const STRATEGY_API_URL = import.meta.env.VITE_STRATEGY_SERVICE_URL || 'http://localhost:8003';

export interface StrategySignal {
  strategy_id: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  target_price?: number;
  stop_loss?: number;
  timestamp: string;
}

export interface StrategyResponse {
  symbol: string;
  fused_signal: StrategySignal;
  individual_signals: StrategySignal[];
  strategy_stats: {
    total_strategies: number;
    enabled_strategies: number;
    total_trades: number;
    avg_win_rate: number;
  };
  timestamp: string;
}

class StrategyApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = STRATEGY_API_URL;
  }

  async evaluateStrategies(request: {
    symbol: string;
    market_data: any;
    indicators: any;
    sentiment: number;
    breakouts: string[];
    fusion_method?: string;
  }): Promise<StrategyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Strategy API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling strategy engine:', error);
      return this.getMockStrategyResponse(request.symbol);
    }
  }

  async getStrategies() {
    try {
      const response = await fetch(`${this.baseUrl}/strategies`);
      return await response.json();
    } catch (error) {
      return { strategies: {}, stats: {} };
    }
  }

  async getTopStrategies(limit: number = 3) {
    try {
      const response = await fetch(`${this.baseUrl}/top-strategies?limit=${limit}`);
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  private getMockStrategyResponse(symbol: string): StrategyResponse {
    const mockSignal: StrategySignal = {
      strategy_id: 'mock_fusion',
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: Math.random() * 0.4 + 0.5,
      reasoning: ['Mock strategy evaluation', 'Simulated market conditions'],
      risk_level: 'MEDIUM',
      timestamp: new Date().toISOString(),
    };

    return {
      symbol,
      fused_signal: mockSignal,
      individual_signals: [mockSignal],
      strategy_stats: {
        total_strategies: 4,
        enabled_strategies: 4,
        total_trades: 100,
        avg_win_rate: 0.65,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const strategyApi = new StrategyApiClient();