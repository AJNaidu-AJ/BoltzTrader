/**
 * Risk Engine API Client for Phase 3 Risk & Policy Layer
 */

const RISK_API_URL = import.meta.env.VITE_RISK_SERVICE_URL || 'http://localhost:8004';

export interface RiskAssessment {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'ALLOW' | 'BLOCK' | 'RESIZE' | 'DELAY';
  confidence: number;
  reasoning: string[];
  adjustments?: {
    quantity?: number;
    delay_minutes?: number;
  };
  timestamp: string;
}

export interface PolicyStats {
  total_policies: number;
  enabled_policies: number;
  total_evaluations: number;
  policy_triggers: Record<string, number>;
  last_updated: string;
}

class RiskApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = RISK_API_URL;
  }

  async evaluateRisk(request: {
    trade_request: any;
    portfolio_state: any;
    market_data: any;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Risk API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling risk engine:', error);
      return this.getMockRiskResponse();
    }
  }

  async getPolicies() {
    try {
      const response = await fetch(`${this.baseUrl}/policies`);
      return await response.json();
    } catch (error) {
      return { policies: [], stats: {} };
    }
  }

  async getStats(): Promise<PolicyStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      return await response.json();
    } catch (error) {
      return {
        total_policies: 4,
        enabled_policies: 4,
        total_evaluations: 0,
        policy_triggers: {},
        last_updated: new Date().toISOString(),
      };
    }
  }

  async testRiskEvaluation() {
    try {
      const response = await fetch(`${this.baseUrl}/test`, { method: 'POST' });
      return await response.json();
    } catch (error) {
      return this.getMockRiskResponse();
    }
  }

  async getPolicyVersions(policyId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/policies/${policyId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch policy versions');
      return await response.json();
    } catch (error) {
      return { versions: [] };
    }
  }

  async getPolicyVersion(policyId: string, version: number) {
    try {
      const response = await fetch(`${this.baseUrl}/api/policies/${policyId}/versions/${version}`);
      if (!response.ok) throw new Error('Failed to fetch policy version');
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async rollbackPolicy(policyId: string, version: number, userId?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/policies/${policyId}/rollback/${version}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (!response.ok) throw new Error('Failed to rollback policy');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  private getMockRiskResponse() {
    const actions = ['ALLOW', 'RESIZE', 'BLOCK'] as const;
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    return {
      assessment: {
        risk_level: 'MEDIUM',
        action,
        confidence: Math.random() * 0.4 + 0.6,
        reasoning: ['Mock risk evaluation', 'Simulated policy check'],
        adjustments: action === 'RESIZE' ? { quantity: 75 } : {},
        timestamp: new Date().toISOString(),
      },
      firewall_stats: {
        total_policies: 4,
        enabled_policies: 4,
        total_evaluations: 100,
        policy_triggers: {
          exposure_control_v1: 5,
          volatility_gate_v1: 3,
          drawdown_controller_v1: 1,
          reputation_logic_v1: 8,
        },
      },
    };
  }
}

export const riskApi = new RiskApiClient();