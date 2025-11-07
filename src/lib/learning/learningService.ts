// Learning Service - Orchestrates the learning loop
import { rlAgent, PerformanceMetric, LearningSnapshot } from './rlAgent';
import { feedbackSystem, FeedbackEvent } from './feedbackSystem';

export class LearningService {
  private learningInterval: NodeJS.Timeout | null = null;
  private isLearning = false;

  // Start automatic learning cycles
  startLearningLoop(intervalMs = 300000): void { // 5 minutes default
    if (this.learningInterval) return;

    this.learningInterval = setInterval(async () => {
      if (!this.isLearning) {
        await this.runLearningCycle();
      }
    }, intervalMs);

    console.log('Learning loop started');
  }

  stopLearningLoop(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
      console.log('Learning loop stopped');
    }
  }

  // Manual learning cycle trigger
  async runLearningCycle(): Promise<LearningSnapshot> {
    this.isLearning = true;
    
    try {
      // Load latest weights
      await rlAgent.loadLatestSnapshot();
      
      // Run learning
      const snapshot = await rlAgent.learn();
      
      // Submit system feedback based on performance
      await this.submitSystemFeedback(snapshot);
      
      console.log('Learning cycle completed:', {
        iteration: snapshot.learning_iteration,
        reward: snapshot.reward_score,
        weights: snapshot.fusion_weights
      });
      
      return snapshot;
    } finally {
      this.isLearning = false;
    }
  }

  // Ingest performance data
  async ingestPerformance(metrics: PerformanceMetric): Promise<void> {
    await rlAgent.ingestPerformance(metrics);
    
    // Auto-trigger learning if significant performance change
    if (Math.abs(metrics.profit_loss) > 1000 || metrics.drawdown > 0.1) {
      setTimeout(() => this.runLearningCycle(), 1000);
    }
  }

  // Submit user feedback
  async submitUserFeedback(feedback: Omit<FeedbackEvent, 'feedback_type'>): Promise<void> {
    await feedbackSystem.submitFeedback({
      ...feedback,
      feedback_type: 'user'
    });
  }

  // Submit system feedback based on performance
  private async submitSystemFeedback(snapshot: LearningSnapshot): Promise<void> {
    const score = this.rewardToFeedbackScore(snapshot.reward_score);
    
    await feedbackSystem.submitFeedback({
      feedback_type: 'system',
      score,
      comment: `Automated feedback: Reward ${snapshot.reward_score.toFixed(4)}, Iteration ${snapshot.learning_iteration}`,
      metadata: {
        learning_iteration: snapshot.learning_iteration,
        fusion_weights: snapshot.fusion_weights,
        adaptive_params: snapshot.adaptive_params
      }
    });
  }

  // Convert reward (-1 to 1) to feedback score (1 to 5)
  private rewardToFeedbackScore(reward: number): number {
    return Math.round(3 + (reward * 2)); // Maps -1->1, 0->3, 1->5
  }

  // Get current learning status
  getStatus() {
    return {
      isLearning: this.isLearning,
      hasActiveLoop: this.learningInterval !== null,
      currentWeights: rlAgent.getCurrentWeights()
    };
  }

  // Get learning history
  async getLearningHistory(limit = 20): Promise<any[]> {
    const { data, error } = await import('@/lib/supabaseClient').then(m => m.supabase)
      .from('learning_snapshots')
      .select('*')
      .order('snapshot_timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export const learningService = new LearningService();