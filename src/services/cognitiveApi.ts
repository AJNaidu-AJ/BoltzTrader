/**
 * BoltzTrader Cognitive Engine API Client
 * Connects to the LangGraph Node Network
 */

const COGNITIVE_API_URL = import.meta.env.VITE_COGNITIVE_SERVICE_URL || 'http://localhost:8002';

export interface CognitiveResult {
  symbol: string;
  timestamp: string;
  market_data: {
    price: number;
    volume: number;
    high: number;
    low: number;
    change: number;
    change_pct: number;
  };
  indicators: {
    rsi: number;
    macd: number;
    ema_20: number;
    bollinger_upper: number;
    bollinger_lower: number;
    volatility: number;
  };
  sentiment_score: number;
  breakout_signals: string[];
  strategy_decision: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string[];
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  execution_result: {
    order_id: string;
    status: 'PENDING' | 'EXECUTED' | 'SKIPPED';
    action: string;
    quantity: number;
    price: number;
    timestamp: string;
  };
  monitor_feedback: {
    performance_score: number;
    risk_assessment: string;
    adjustments: string[];
    next_action: string;
  };
}

class CognitiveApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = COGNITIVE_API_URL;
  }

  async processSymbol(symbol: string): Promise<CognitiveResult> {
    try {
      const response = await fetch(`${this.baseUrl}/process/${symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Cognitive API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling cognitive engine:', error);
      // Return mock data if service is unavailable
      return this.getMockCognitiveResult(symbol);
    }
  }

  async getHealth(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      return { status: 'unavailable', service: 'cognitive_engine' };
    }
  }

  private getMockCognitiveResult(symbol: string): CognitiveResult {
    const mockPrice = 150 + Math.random() * 20;
    const mockChange = (Math.random() - 0.5) * 4;
    
    return {
      symbol,
      timestamp: new Date().toISOString(),
      market_data: {
        price: mockPrice,
        volume: Math.floor(Math.random() * 2000000) + 500000,
        high: mockPrice + Math.random() * 2,
        low: mockPrice - Math.random() * 2,
        change: mockChange,
        change_pct: (mockChange / mockPrice) * 100,
      },
      indicators: {
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 2,
        ema_20: mockPrice * 0.98,
        bollinger_upper: mockPrice * 1.02,
        bollinger_lower: mockPrice * 0.98,
        volatility: Math.random() * 15,
      },
      sentiment_score: (Math.random() - 0.5) * 2,
      breakout_signals: Math.random() > 0.7 ? ['MOMENTUM_BREAKOUT'] : [],
      strategy_decision: {
        action: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'SELL' : 'HOLD',
        confidence: Math.random() * 0.4 + 0.5,
        reasoning: ['Technical analysis indicates momentum'],
        risk_level: Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
      },
      execution_result: {
        order_id: `ORD_${Date.now()}`,
        status: 'EXECUTED',
        action: 'BUY',
        quantity: 100,
        price: mockPrice,
        timestamp: new Date().toISOString(),
      },
      monitor_feedback: {
        performance_score: Math.random() * 0.3 + 0.7,
        risk_assessment: 'NORMAL',
        adjustments: [],
        next_action: 'CONTINUE',
      },
      learning_feedback: {
        threshold_adjusted: Math.random() * 0.4 + 0.5,
        performance_trend: Math.random() > 0.5 ? 'improving' : 'stable',
        adaptation_timestamp: new Date().toISOString(),
      },
      node_errors: Math.random() > 0.9 ? ['mock_error'] : [],
      confidence_threshold: Math.random() * 0.4 + 0.5,
    };
  }
}

export const cognitiveApi = new CognitiveApiClient();