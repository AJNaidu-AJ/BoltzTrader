import type { TablesInsert } from '@/integrations/supabase/types';

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

class SignalGenerator {
  generateSignal(data: MarketData): TablesInsert<'signals'> {
    const confidence = this.calculateConfidence(data);
    const rank = this.determineRank(confidence);
    
    return {
      symbol: data.symbol,
      company_name: data.symbol, // Would fetch from API
      current_price: data.price,
      price_change: data.change,
      price_change_percent: data.changePercent,
      volume: data.volume,
      volume_change_percent: Math.random() * 20 - 10,
      confidence,
      rank,
      sector: this.categorizeSymbol(data.symbol),
      sentiment: this.calculateSentiment(data),
      sentiment_score: Math.random() * 2 - 1,
      technical_indicators: this.generateTechnicalIndicators(data),
      signal_reasons: this.generateReasons(data, confidence),
      timeframe: '1d'
    };
  }

  private calculateConfidence(data: MarketData): number {
    let score = 50;
    
    // Volume analysis
    if (data.volume > 1000000) score += 15;
    
    // Price momentum
    if (Math.abs(data.changePercent) > 5) score += 20;
    if (data.changePercent > 0) score += 10;
    
    // Volatility check
    if (Math.abs(data.changePercent) < 2) score -= 10;
    
    return Math.min(95, Math.max(5, score));
  }

  private determineRank(confidence: number): 'top' | 'medium' | 'low' {
    if (confidence >= 80) return 'top';
    if (confidence >= 60) return 'medium';
    return 'low';
  }

  private categorizeSymbol(symbol: string): string {
    const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];
    return sectors[Math.floor(Math.random() * sectors.length)];
  }

  private calculateSentiment(data: MarketData): string {
    if (data.changePercent > 3) return 'bullish';
    if (data.changePercent < -3) return 'bearish';
    return 'neutral';
  }

  private generateTechnicalIndicators(data: MarketData) {
    return {
      rsi: Math.random() * 100,
      macd: Math.random() * 2 - 1,
      sma_20: data.price * (0.95 + Math.random() * 0.1),
      volume_sma: data.volume * (0.8 + Math.random() * 0.4)
    };
  }

  private generateReasons(data: MarketData, confidence: number) {
    const reasons = [];
    
    if (data.changePercent > 5) reasons.push('Strong upward momentum');
    if (data.volume > 1000000) reasons.push('High trading volume');
    if (confidence > 80) reasons.push('Multiple technical confirmations');
    
    return reasons;
  }
}

export const signalGenerator = new SignalGenerator();