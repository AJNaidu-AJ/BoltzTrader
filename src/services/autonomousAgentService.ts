import { supabase } from '@/integrations/supabase/client';

interface AgentConfig {
  isEnabled: boolean;
  maxDailyTrades: number;
  maxPositionSize: number;
  maxDailyLoss: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  allowedSymbols: string[];
  minConfidence: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

interface TradeDecision {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  quantity: number;
  confidence: number;
  reasoning: string[];
  riskScore: number;
  expectedReturn: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
}

interface AgentFeedback {
  decisionId: string;
  userAction: 'approved' | 'rejected' | 'modified';
  actualOutcome?: 'profit' | 'loss' | 'neutral';
  userNotes?: string;
  performanceScore: number;
}

class AutonomousAgentService {
  private config: AgentConfig = {
    isEnabled: false,
    maxDailyTrades: 5,
    maxPositionSize: 1000,
    maxDailyLoss: 500,
    riskLevel: 'moderate',
    allowedSymbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
    minConfidence: 0.7,
    stopLossPercent: 5,
    takeProfitPercent: 10
  };

  async getAgentConfig(): Promise<AgentConfig> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.config;

      const { data } = await supabase
        .from('agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return data?.config || this.config;
    } catch (error) {
      return this.config;
    }
  }

  async updateAgentConfig(config: Partial<AgentConfig>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updatedConfig = { ...this.config, ...config };

    await supabase
      .from('agent_configs')
      .upsert({
        user_id: user.id,
        config: updatedConfig
      });

    this.config = updatedConfig;
  }

  async generateTradeDecision(marketData: any): Promise<TradeDecision | null> {
    const config = await this.getAgentConfig();
    if (!config.isEnabled) return null;

    // Check daily limits
    const dailyStats = await this.getDailyStats();
    if (dailyStats.tradeCount >= config.maxDailyTrades) return null;
    if (dailyStats.totalLoss >= config.maxDailyLoss) return null;

    // AI decision logic
    const decision = await this.analyzeMarketAndDecide(marketData, config);
    
    if (decision && decision.confidence >= config.minConfidence) {
      // Apply risk checks
      const riskAdjustedDecision = this.applyRiskLimits(decision, config);
      
      // Save decision for tracking
      await this.saveTradeDecision(riskAdjustedDecision);
      
      return riskAdjustedDecision;
    }

    return null;
  }

  private async analyzeMarketAndDecide(marketData: any, config: AgentConfig): Promise<TradeDecision> {
    // Mock AI analysis - replace with actual ML model
    const symbols = config.allowedSymbols;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0
    const action = Math.random() > 0.5 ? 'buy' : 'sell';
    const baseQuantity = Math.floor(Math.random() * 100) + 10;
    
    const reasoning = this.generateReasoning(action, confidence);
    const riskScore = this.calculateRiskScore(marketData, config);
    
    return {
      id: `decision_${Date.now()}`,
      symbol,
      action: action as 'buy' | 'sell',
      quantity: baseQuantity,
      confidence,
      reasoning,
      riskScore,
      expectedReturn: (Math.random() - 0.5) * 20, // -10% to +10%
      stopLoss: action === 'buy' ? marketData.price * (1 - config.stopLossPercent / 100) : marketData.price * (1 + config.stopLossPercent / 100),
      takeProfit: action === 'buy' ? marketData.price * (1 + config.takeProfitPercent / 100) : marketData.price * (1 - config.takeProfitPercent / 100),
      timestamp: new Date().toISOString()
    };
  }

  private generateReasoning(action: string, confidence: number): string[] {
    const reasons = [];
    
    if (confidence > 0.8) {
      reasons.push('Strong technical indicators alignment');
    }
    if (action === 'buy') {
      reasons.push('Bullish momentum detected');
      reasons.push('Support level holding strong');
    } else {
      reasons.push('Bearish divergence identified');
      reasons.push('Resistance level rejection');
    }
    
    reasons.push(`High confidence signal (${(confidence * 100).toFixed(1)}%)`);
    
    return reasons;
  }

  private calculateRiskScore(marketData: any, config: AgentConfig): number {
    // Risk scoring based on volatility, position size, etc.
    const volatilityRisk = Math.min(marketData.volatility || 0.2, 1.0);
    const positionRisk = Math.min(marketData.positionSize / config.maxPositionSize, 1.0);
    const marketRisk = Math.random() * 0.3; // Market conditions risk
    
    return (volatilityRisk + positionRisk + marketRisk) / 3;
  }

  private applyRiskLimits(decision: TradeDecision, config: AgentConfig): TradeDecision {
    // Adjust quantity based on risk level
    let maxQuantity = config.maxPositionSize;
    
    if (config.riskLevel === 'conservative') {
      maxQuantity *= 0.5;
    } else if (config.riskLevel === 'moderate') {
      maxQuantity *= 0.75;
    }
    
    // Reduce quantity if high risk
    if (decision.riskScore > 0.7) {
      maxQuantity *= 0.6;
    }
    
    return {
      ...decision,
      quantity: Math.min(decision.quantity, maxQuantity)
    };
  }

  async saveTradeDecision(decision: TradeDecision): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('agent_decisions')
      .insert({
        user_id: user.id,
        decision_id: decision.id,
        symbol: decision.symbol,
        action: decision.action,
        quantity: decision.quantity,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        risk_score: decision.riskScore,
        expected_return: decision.expectedReturn,
        status: 'pending'
      });
  }

  async submitFeedback(feedback: AgentFeedback): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save feedback
    await supabase
      .from('agent_feedback')
      .insert({
        user_id: user.id,
        decision_id: feedback.decisionId,
        user_action: feedback.userAction,
        actual_outcome: feedback.actualOutcome,
        user_notes: feedback.userNotes,
        performance_score: feedback.performanceScore
      });

    // Update decision status
    await supabase
      .from('agent_decisions')
      .update({ 
        status: feedback.userAction,
        performance_score: feedback.performanceScore
      })
      .eq('decision_id', feedback.decisionId);

    // Trigger learning update
    await this.updateLearningModel(feedback);
  }

  private async updateLearningModel(feedback: AgentFeedback): Promise<void> {
    // Update ML model based on feedback
    // This would integrate with your ML pipeline
    console.log('Updating learning model with feedback:', feedback);
    
    // Mock learning update
    const learningData = {
      decisionId: feedback.decisionId,
      feedback: feedback.userAction,
      outcome: feedback.actualOutcome,
      score: feedback.performanceScore,
      timestamp: new Date().toISOString()
    };
    
    // In production, this would send to ML training pipeline
    await this.saveLearningData(learningData);
  }

  private async saveLearningData(data: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('agent_learning_data')
      .insert({
        user_id: user.id,
        ...data
      });
  }

  async getDailyStats(): Promise<{ tradeCount: number; totalLoss: number; totalProfit: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { tradeCount: 0, totalLoss: 0, totalProfit: 0 };

    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('agent_decisions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    const tradeCount = data?.length || 0;
    const totalLoss = data?.filter(d => d.performance_score < 0).reduce((sum, d) => sum + Math.abs(d.performance_score), 0) || 0;
    const totalProfit = data?.filter(d => d.performance_score > 0).reduce((sum, d) => sum + d.performance_score, 0) || 0;

    return { tradeCount, totalLoss, totalProfit };
  }

  async getAgentPerformance(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('agent_decisions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data || data.length === 0) return null;

    const totalDecisions = data.length;
    const approvedDecisions = data.filter(d => d.status === 'approved').length;
    const avgConfidence = data.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions;
    const avgPerformance = data.filter(d => d.performance_score !== null).reduce((sum, d) => sum + d.performance_score, 0) / data.filter(d => d.performance_score !== null).length;

    return {
      totalDecisions,
      approvalRate: approvedDecisions / totalDecisions,
      avgConfidence,
      avgPerformance: avgPerformance || 0,
      recentDecisions: data.slice(0, 10)
    };
  }
}

export const autonomousAgentService = new AutonomousAgentService();
export type { AgentConfig, TradeDecision, AgentFeedback };