import { supabase } from '@/integrations/supabase/client';

interface GPTUsageLog {
  user_id?: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  endpoint: string;
  request_id: string;
  timestamp: string;
}

class GPTUsageLogger {
  private readonly tokenCosts = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
  };

  async logUsage(usage: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    endpoint: string;
    requestId?: string;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const costs = this.tokenCosts[usage.model as keyof typeof this.tokenCosts];
      const cost = costs ? 
        (usage.promptTokens * costs.input + usage.completionTokens * costs.output) / 1000 : 0;

      const logEntry: GPTUsageLog = {
        user_id: user?.id,
        model: usage.model,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
        cost_usd: cost,
        endpoint: usage.endpoint,
        request_id: usage.requestId || this.generateRequestId(),
        timestamp: new Date().toISOString()
      };

      await supabase
        .from('gpt_usage_logs')
        .insert(logEntry);

    } catch (error) {
      console.error('Failed to log GPT usage:', error);
    }
  }

  async getUsageStats(days: number = 30): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('gpt_usage_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    return {
      totalTokens: data?.reduce((sum, log) => sum + log.total_tokens, 0) || 0,
      totalCost: data?.reduce((sum, log) => sum + log.cost_usd, 0) || 0,
      requestCount: data?.length || 0,
      byModel: this.groupByModel(data || [])
    };
  }

  private groupByModel(logs: any[]): Record<string, any> {
    return logs.reduce((acc, log) => {
      if (!acc[log.model]) {
        acc[log.model] = { tokens: 0, cost: 0, requests: 0 };
      }
      acc[log.model].tokens += log.total_tokens;
      acc[log.model].cost += log.cost_usd;
      acc[log.model].requests += 1;
      return acc;
    }, {});
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const gptUsageLogger = new GPTUsageLogger();
export type { GPTUsageLog };