// Feedback System for Learning Loop
import { supabase } from '@/lib/supabaseClient';

export interface FeedbackEvent {
  strategy_id?: string;
  user_id?: string;
  feedback_type: 'user' | 'system' | 'performance';
  score: number; // 1-5 scale
  comment?: string;
  metadata?: Record<string, any>;
}

export class FeedbackSystem {
  async submitFeedback(feedback: FeedbackEvent): Promise<void> {
    const { error } = await supabase
      .from('feedback_events')
      .insert({
        strategy_id: feedback.strategy_id,
        user_id: feedback.user_id,
        feedback_type: feedback.feedback_type,
        score: feedback.score,
        comment: feedback.comment,
        metadata: feedback.metadata || {}
      });

    if (error) throw error;
  }

  async getFeedbackForStrategy(strategyId: string, limit = 50): Promise<FeedbackEvent[]> {
    const { data, error } = await supabase
      .from('feedback_events')
      .select('*')
      .eq('strategy_id', strategyId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getAverageFeedbackScore(strategyId?: string): Promise<number> {
    let query = supabase
      .from('feedback_events')
      .select('score');

    if (strategyId) {
      query = query.eq('strategy_id', strategyId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return 3; // neutral default

    const avgScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
    return avgScore;
  }

  // Normalize feedback into reward signal
  normalizeFeedbackToReward(feedbacks: FeedbackEvent[]): number {
    if (feedbacks.length === 0) return 0;

    const avgScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;
    // Convert 1-5 scale to -1 to 1 scale
    return (avgScore - 3) / 2;
  }
}

export const feedbackSystem = new FeedbackSystem();