/**
 * OpenAI Integration for BoltzCopilot
 * Handles AI chat and command processing
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface CopilotCommand {
  command: string;
  params: Record<string, any>;
  apiEndpoint: string;
  method: 'GET' | 'POST';
}

export class BoltzCopilot {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private context: ChatMessage[] = [];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }

  async processMessage(message: string): Promise<string> {
    // Check if it's a command
    const command = this.parseCommand(message);
    if (command) {
      return await this.executeCommand(command);
    }

    // Regular chat with context
    return await this.chatWithContext(message);
  }

  private parseCommand(message: string): CopilotCommand | null {
    const commandPatterns = [
      {
        pattern: /explain (last )?trade/i,
        command: 'explain_trade',
        endpoint: '/api/execution/last/explain',
        method: 'GET' as const
      },
      {
        pattern: /show volatility/i,
        command: 'show_volatility',
        endpoint: '/api/risk/volatility',
        method: 'GET' as const
      },
      {
        pattern: /compare (\w+) vs (\w+)/i,
        command: 'compare_strategies',
        endpoint: '/api/strategies/compare',
        method: 'POST' as const
      },
      {
        pattern: /risk status/i,
        command: 'risk_status',
        endpoint: '/api/risk/status',
        method: 'GET' as const
      },
      {
        pattern: /portfolio summary/i,
        command: 'portfolio_summary',
        endpoint: '/api/portfolio/summary',
        method: 'GET' as const
      }
    ];

    for (const { pattern, command, endpoint, method } of commandPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          command,
          params: match.groups || {},
          apiEndpoint: endpoint,
          method
        };
      }
    }

    return null;
  }

  private async executeCommand(command: CopilotCommand): Promise<string> {
    try {
      // Mock API responses for development
      const mockResponses: Record<string, any> = {
        explain_trade: {
          symbol: 'AAPL',
          action: 'BUY',
          reasoning: 'Momentum strategy detected bullish breakout with 0.85 confidence',
          risk_assessment: 'MEDIUM risk, position sized at 12% of portfolio'
        },
        show_volatility: {
          current_vix: 22.5,
          trend: 'increasing',
          recommendation: 'Reduce position sizes due to elevated volatility'
        },
        compare_strategies: {
          momentum: { sharpe: 1.8, returns: 0.15 },
          breakout: { sharpe: 1.2, returns: 0.12 },
          winner: 'momentum'
        },
        risk_status: {
          exposure: 0.65,
          drawdown: -0.032,
          policies_triggered: 0,
          status: 'HEALTHY'
        },
        portfolio_summary: {
          total_value: 250000,
          cash: 50000,
          positions: 8,
          daily_pnl: 2847,
          daily_return: 0.0142
        }
      };

      const response = mockResponses[command.command];
      return this.formatCommandResponse(command.command, response);
    } catch (error) {
      return `Error executing command: ${error}`;
    }
  }

  private formatCommandResponse(command: string, data: any): string {
    switch (command) {
      case 'explain_trade':
        return `Last trade: ${data.action} ${data.symbol}\nReasoning: ${data.reasoning}\nRisk: ${data.risk_assessment}`;
      
      case 'show_volatility':
        return `VIX: ${data.current_vix} (${data.trend})\nRecommendation: ${data.recommendation}`;
      
      case 'compare_strategies':
        return `Momentum: Sharpe ${data.momentum.sharpe}, Returns ${(data.momentum.returns * 100).toFixed(1)}%\nBreakout: Sharpe ${data.breakout.sharpe}, Returns ${(data.breakout.returns * 100).toFixed(1)}%\nWinner: ${data.winner}`;
      
      case 'risk_status':
        return `Exposure: ${(data.exposure * 100).toFixed(1)}%\nDrawdown: ${(data.drawdown * 100).toFixed(1)}%\nStatus: ${data.status}`;
      
      case 'portfolio_summary':
        return `Portfolio Value: $${data.total_value.toLocaleString()}\nCash: $${data.cash.toLocaleString()}\nPositions: ${data.positions}\nDaily P&L: $${data.daily_pnl} (${(data.daily_return * 100).toFixed(2)}%)`;
      
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private async chatWithContext(message: string): Promise<string> {
    // Add user message to context
    this.context.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Mock AI responses for development
    const responses = [
      "I'm analyzing the market conditions for you...",
      "Based on current data, I recommend monitoring volatility levels.",
      "The momentum strategy is performing well today with a 0.85 confidence score.",
      "Risk levels are within acceptable parameters. All policies are green.",
      "I've processed your request. Would you like me to explain the reasoning?",
      "Current portfolio exposure is at 65%. Consider rebalancing if it exceeds 80%."
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    // Add assistant response to context
    this.context.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    // Keep context manageable
    if (this.context.length > 20) {
      this.context = this.context.slice(-20);
    }

    return response;
  }

  getContext(): ChatMessage[] {
    return this.context;
  }

  clearContext(): void {
    this.context = [];
  }
}

export const boltzCopilot = new BoltzCopilot();