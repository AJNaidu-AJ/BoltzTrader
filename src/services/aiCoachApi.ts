interface RiskProfile {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  holding_time: 'short' | 'medium' | 'long';
  trade_frequency: 'low' | 'medium' | 'high';
  max_position_size: number;
  preferred_sectors: string[];
}

interface DailySummary {
  matching_signals_count: number;
  total_signals_count: number;
  risk_profile: RiskProfile;
  coach_message: string;
  recommendations: string[];
  market_outlook: string;
}

class AICoachService {
  private baseUrl = import.meta.env.VITE_SCORING_SERVICE_URL || 'http://localhost:8000';

  async generateDailySummary(userId: string, riskProfile: RiskProfile): Promise<DailySummary> {
    try {
      const response = await fetch(`${this.baseUrl}/api/coach/daily-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          risk_profile: riskProfile
        })
      });

      if (!response.ok) {
        throw new Error(`AI Coach failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback summary if API fails
      return this.generateFallbackSummary(riskProfile);
    }
  }

  private generateFallbackSummary(riskProfile: RiskProfile): DailySummary {
    const riskMessages = {
      conservative: "Focus on stable, high-confidence signals with lower volatility.",
      moderate: "Balance between growth opportunities and risk management.",
      aggressive: "Capitalize on high-potential signals with proper position sizing."
    };

    const frequencyMessages = {
      low: "Quality over quantity - wait for the best setups.",
      medium: "Maintain steady trading rhythm with selective entries.",
      high: "Stay active but maintain discipline in signal selection."
    };

    return {
      matching_signals_count: Math.floor(Math.random() * 8) + 2,
      total_signals_count: Math.floor(Math.random() * 20) + 10,
      risk_profile: riskProfile,
      coach_message: `${riskMessages[riskProfile.risk_tolerance]} ${frequencyMessages[riskProfile.trade_frequency]}`,
      recommendations: [
        "Review your position sizes before trading",
        "Consider market conditions for timing",
        "Stick to your risk management rules"
      ],
      market_outlook: "Mixed signals in the market today - stay selective"
    };
  }

  async getPersonalizedSignals(userId: string, riskProfile: RiskProfile) {
    try {
      const response = await fetch(`${this.baseUrl}/api/coach/personalized-signals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          risk_profile: riskProfile
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get personalized signals: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Personalized signals error:', error);
      return { signals: [], message: 'Unable to load personalized signals' };
    }
  }
}

export const aiCoachService = new AICoachService();
export type { RiskProfile, DailySummary };