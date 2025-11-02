/**
 * Realtime Data Handler for Boltz Terminal
 * Manages WebSocket connections and live data streams
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

export interface RealtimeData {
  type: 'cognitive_state' | 'strategy_update' | 'risk_evaluation' | 'order_execution';
  payload: any;
  timestamp: string;
}

export class RealtimeManager {
  private subscribers: Map<string, (data: RealtimeData) => void> = new Map();
  private channels: Map<string, any> = new Map();

  subscribe(channel: string, callback: (data: RealtimeData) => void) {
    this.subscribers.set(channel, callback);
    
    const supabaseChannel = supabase
      .channel(channel)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: this.getTableForChannel(channel) },
        (payload) => {
          callback({
            type: channel as any,
            payload: payload.new,
            timestamp: new Date().toISOString()
          });
        }
      )
      .subscribe();

    this.channels.set(channel, supabaseChannel);
  }

  unsubscribe(channel: string) {
    const supabaseChannel = this.channels.get(channel);
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
      this.channels.delete(channel);
    }
    this.subscribers.delete(channel);
  }

  private getTableForChannel(channel: string): string {
    switch (channel) {
      case 'cognitive_state': return 'cognitive_states';
      case 'strategy_update': return 'strategy_performance';
      case 'risk_evaluation': return 'risk_evaluations';
      case 'order_execution': return 'trades';
      default: return 'signals';
    }
  }

  // Simulate live data for development
  simulateLiveData(channel: string) {
    const callback = this.subscribers.get(channel);
    if (!callback) return;

    const mockData = this.generateMockData(channel);
    callback(mockData);
  }

  private generateMockData(channel: string): RealtimeData {
    const baseData = {
      timestamp: new Date().toISOString()
    };

    switch (channel) {
      case 'cognitive_state':
        return {
          type: 'cognitive_state',
          payload: {
            node: 'strategy',
            confidence: Math.random(),
            status: 'processing',
            ...baseData
          },
          timestamp: baseData.timestamp
        };

      case 'strategy_update':
        return {
          type: 'strategy_update',
          payload: {
            strategy_id: 'momentum_v1',
            performance: Math.random() * 0.1 - 0.05,
            sharpe_ratio: Math.random() * 2,
            ...baseData
          },
          timestamp: baseData.timestamp
        };

      case 'risk_evaluation':
        return {
          type: 'risk_evaluation',
          payload: {
            risk_level: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            action: ['ALLOW', 'RESIZE', 'BLOCK'][Math.floor(Math.random() * 3)],
            confidence: Math.random(),
            ...baseData
          },
          timestamp: baseData.timestamp
        };

      case 'order_execution':
        return {
          type: 'order_execution',
          payload: {
            symbol: ['AAPL', 'MSFT', 'GOOGL'][Math.floor(Math.random() * 3)],
            action: Math.random() > 0.5 ? 'BUY' : 'SELL',
            quantity: Math.floor(Math.random() * 100) + 1,
            price: Math.random() * 1000 + 100,
            status: 'FILLED',
            ...baseData
          },
          timestamp: baseData.timestamp
        };

      default:
        return {
          type: 'cognitive_state',
          payload: baseData,
          timestamp: baseData.timestamp
        };
    }
  }
}

export const realtimeManager = new RealtimeManager();