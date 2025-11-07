export interface FeedbackEntry {
  id: string;
  strategy_id: string;
  user_id: string;
  benchmark: string;
  ai_return: number;
  benchmark_return: number;
  alpha: number;
  reward: number;
  outcome: 'positive' | 'neutral' | 'negative';
  learning_cycle: number;
  created_at: string;
}

export interface PerformanceEvaluation {
  alpha: number;
  reward: number;
  outcome: 'positive' | 'neutral' | 'negative';
}

export interface TrainingPayload {
  strategy_id: string;
  reward: number;
  alpha: number;
  outcome: string;
}