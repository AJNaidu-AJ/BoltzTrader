// Reinforcement Learning Agent for BoltzTrader
import { supabase } from '@/lib/supabaseClient';

export interface PerformanceMetric {
  strategy_id: string;
  profit_loss: number;
  drawdown: number;
  sharpe_ratio: number;
  total_trades: number;
  win_rate: number;
  timestamp?: string;
}

export interface FusionWeights {
  momentum: number;
  breakout: number;
  mean_reversion: number;
  sentiment: number;
}

export interface LearningSnapshot {
  fusion_weights: FusionWeights;
  reward_score: number;
  learning_iteration: number;
  performance_window: PerformanceMetric[];
  adaptive_params: Record<string, number>;
}

export class RLAgent {
  private currentWeights: FusionWeights = {
    momentum: 0.25,
    breakout: 0.25,
    mean_reversion: 0.25,
    sentiment: 0.25
  };
  
  private learningRate = 0.01;
  private iteration = 0;

  calculateReward(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;

    const avgProfitLoss = metrics.reduce((sum, m) => sum + m.profit_loss, 0) / metrics.length;
    const avgDrawdown = metrics.reduce((sum, m) => sum + m.drawdown, 0) / metrics.length;
    const avgSharpe = metrics.reduce((sum, m) => sum + (m.sharpe_ratio || 0), 0) / metrics.length;

    const reward = (avgProfitLoss * 0.5) - (avgDrawdown * 0.3) + (avgSharpe * 0.2);
    return Math.tanh(reward / 100);
  }

  updateWeights(reward: number): FusionWeights {
    const adjustment = reward * this.learningRate;
    
    const newWeights = {
      momentum: Math.max(0.1, Math.min(0.4, this.currentWeights.momentum + adjustment)),
      breakout: Math.max(0.1, Math.min(0.4, this.currentWeights.breakout + adjustment * 0.8)),
      mean_reversion: Math.max(0.1, Math.min(0.4, this.currentWeights.mean_reversion - adjustment * 0.5)),
      sentiment: Math.max(0.1, Math.min(0.4, this.currentWeights.sentiment + adjustment * 0.3))
    };

    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    Object.keys(newWeights).forEach(key => {
      newWeights[key as keyof FusionWeights] /= total;
    });

    this.currentWeights = newWeights;
    this.iteration++;
    
    return this.currentWeights;
  }

  async ingestPerformance(metrics: PerformanceMetric): Promise<void> {
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metrics);

    if (error) throw error;
  }

  async learn(): Promise<LearningSnapshot> {
    const { data: recentMetrics, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    const metrics = recentMetrics || [];
    const reward = this.calculateReward(metrics);
    const newWeights = this.updateWeights(reward);

    const snapshot: LearningSnapshot = {
      fusion_weights: newWeights,
      reward_score: reward,
      learning_iteration: this.iteration,
      performance_window: metrics.slice(0, 10),
      adaptive_params: {
        learning_rate: this.learningRate,
        volatility_threshold: 0.02 + (reward * 0.01),
        risk_multiplier: 1.0 - (reward * 0.1)
      }
    };

    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  private async saveSnapshot(snapshot: LearningSnapshot): Promise<void> {
    const { error } = await supabase
      .from('learning_snapshots')
      .insert({
        fusion_weights: snapshot.fusion_weights,
        reward_score: snapshot.reward_score,
        learning_iteration: snapshot.learning_iteration,
        performance_window: snapshot.performance_window,
        adaptive_params: snapshot.adaptive_params
      });

    if (error) throw error;
  }

  getCurrentWeights(): FusionWeights {
    return { ...this.currentWeights };
  }

  async loadLatestSnapshot(): Promise<void> {
    const { data, error } = await supabase
      .from('learning_snapshots')
      .select('*')
      .order('snapshot_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return;

    this.currentWeights = data.fusion_weights;
    this.iteration = data.learning_iteration;
  }
}

export const rlAgent = new RLAgent();