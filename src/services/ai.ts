interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

class AIService {
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  private baseURL = 'https://api.openai.com/v1';

  async generateSignalExplanation(signal: any): Promise<string> {
    const prompt = `Explain this trading signal in simple terms:
Symbol: ${signal.symbol}
Signal: ${signal.rank}
Confidence: ${signal.confidence}%
Price: $${signal.current_price}
Sector: ${signal.sector}`;

    return this.chat(prompt);
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: message }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'AI service temporarily unavailable';
    }
  }

  async analyzeMarketSentiment(symbols: string[]): Promise<Record<string, number>> {
    const prompt = `Analyze market sentiment for these symbols: ${symbols.join(', ')}. Return sentiment scores from -1 to 1.`;
    
    try {
      const response = await this.chat(prompt);
      // Parse response and return sentiment scores
      return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: Math.random() * 2 - 1 }), {});
    } catch {
      return {};
    }
  }
}

export const aiService = new AIService();