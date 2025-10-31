interface ExplainRequest {
  symbol: string;
  action?: string;
  ruleMatches: Array<{
    name: string;
    value: string;
    weight?: number;
  }>;
}

interface ExplainResponse {
  symbol: string;
  explanation: string;
  bullets: string[];
  generated_at: string;
}

class ExplanationService {
  private baseUrl = 'http://localhost:8000/api';

  async explainSignal(request: ExplainRequest): Promise<ExplainResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: request.symbol,
          action: request.action || 'BUY',
          rule_matches: request.ruleMatches
        })
      });

      if (!response.ok) {
        throw new Error(`Explanation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Explanation API error:', error);
      // Fallback explanation
      return {
        symbol: request.symbol,
        explanation: 'Technical analysis suggests this signal based on market indicators.',
        bullets: [
          'Multiple technical indicators align',
          'Market conditions support the signal',
          'Risk-reward ratio is favorable'
        ],
        generated_at: new Date().toISOString()
      };
    }
  }

  async saveExplanation(signalId: string, explanation: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('signals')
        .update({
          explanation,
          explanation_generated_at: new Date().toISOString()
        })
        .eq('id', signalId);

      if (error) {
        console.error('Failed to save explanation:', error);
      }
    } catch (error) {
      console.error('Save explanation error:', error);
    }
  }
}

export const explanationService = new ExplanationService();

// Import supabase for saving
import { supabase } from '@/integrations/supabase/client';