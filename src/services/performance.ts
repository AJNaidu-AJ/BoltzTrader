import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

interface PerformanceMetrics {
  totalSignals: number;
  accurateSignals: number;
  winRate: number;
  avgReturn: number;
  totalReturn: number;
  bestTrade: number;
  worstTrade: number;
}

class PerformanceService {
  async trackSignalPerformance(signalId: string, entryPrice: number, exitPrice?: number) {
    const performance: TablesInsert<'signal_performance'> = {
      signal_id: signalId,
      symbol: 'TEMP', // Would get from signal
      entry_price: entryPrice,
      entry_time: new Date().toISOString(),
      exit_price: exitPrice,
      exit_time: exitPrice ? new Date().toISOString() : null,
      confidence_at_entry: 75, // Would get from signal
      timeframe: '1d',
      return_percent: exitPrice ? ((exitPrice - entryPrice) / entryPrice) * 100 : null,
      was_accurate: exitPrice ? exitPrice > entryPrice : null
    };

    return supabase.from('signal_performance').insert(performance).select().single();
  }

  async calculateUserMetrics(userId: string): Promise<PerformanceMetrics> {
    const { data: performances } = await supabase
      .from('signal_performance')
      .select('*')
      .eq('user_id', userId)
      .not('exit_price', 'is', null);

    if (!performances?.length) {
      return {
        totalSignals: 0,
        accurateSignals: 0,
        winRate: 0,
        avgReturn: 0,
        totalReturn: 0,
        bestTrade: 0,
        worstTrade: 0
      };
    }

    const accurateSignals = performances.filter(p => p.was_accurate).length;
    const returns = performances.map(p => p.return_percent || 0);
    
    return {
      totalSignals: performances.length,
      accurateSignals,
      winRate: (accurateSignals / performances.length) * 100,
      avgReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
      totalReturn: returns.reduce((a, b) => a + b, 0),
      bestTrade: Math.max(...returns),
      worstTrade: Math.min(...returns)
    };
  }

  async getHistoricalAccuracy(timeframe: '1d' | '1w' | '1m' = '1d') {
    const { data } = await supabase
      .from('signal_performance')
      .select('was_accurate, created_at')
      .eq('timeframe', timeframe)
      .not('was_accurate', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data?.length) return 0;

    const accurate = data.filter(d => d.was_accurate).length;
    return (accurate / data.length) * 100;
  }

  async generateReport(userId: string, startDate: string, endDate: string) {
    const metrics = await this.calculateUserMetrics(userId);
    const accuracy = await this.getHistoricalAccuracy();

    return {
      period: { start: startDate, end: endDate },
      metrics,
      accuracy,
      generatedAt: new Date().toISOString()
    };
  }
}

export const performanceService = new PerformanceService();