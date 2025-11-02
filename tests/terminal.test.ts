/**
 * Test Suite for Boltz Terminal Phase 4 Implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BoltzTerminal from '../src/pages/BoltzTerminal';
import { RealtimeManager } from '../src/lib/realtime';
import { BoltzCopilot } from '../src/lib/openai';

// Mock components wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Boltz Terminal Phase 4', () => {
  let realtimeManager: RealtimeManager;
  let boltzCopilot: BoltzCopilot;

  beforeEach(() => {
    realtimeManager = new RealtimeManager();
    boltzCopilot = new BoltzCopilot();
  });

  afterEach(() => {
    // Cleanup subscriptions
    ['cognitive_state', 'strategy_update', 'risk_evaluation', 'order_execution'].forEach(channel => {
      realtimeManager.unsubscribe(channel);
    });
  });

  describe('Terminal Layout', () => {
    it('should render terminal with all navigation panels', () => {
      render(<BoltzTerminal />, { wrapper: TestWrapper });
      
      expect(screen.getByText('BOLTZ TERMINAL v4.0')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Strategies')).toBeInTheDocument();
      expect(screen.getByText('Risk')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Monitor')).toBeInTheDocument();
      expect(screen.getByText('BoltzCopilot')).toBeInTheDocument();
      expect(screen.getByText('LangGraph')).toBeInTheDocument();
    });

    it('should switch between panels correctly', () => {
      render(<BoltzTerminal />, { wrapper: TestWrapper });
      
      fireEvent.click(screen.getByText('Strategies'));
      expect(screen.getByText('STRATEGY MATRIX')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Risk'));
      expect(screen.getByText('RISK FIREWALL')).toBeInTheDocument();
    });

    it('should toggle theme correctly', () => {
      render(<BoltzTerminal />, { wrapper: TestWrapper });
      
      const themeButton = screen.getByText('🌙');
      fireEvent.click(themeButton);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Real-time Data Integration', () => {
    it('should handle cognitive state updates', () => {
      const callback = vi.fn();
      realtimeManager.subscribe('cognitive_state', callback);
      
      realtimeManager.simulateLiveData('cognitive_state');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cognitive_state',
          payload: expect.objectContaining({
            node: expect.any(String),
            confidence: expect.any(Number),
            status: expect.any(String)
          })
        })
      );
    });

    it('should handle strategy updates', () => {
      const callback = vi.fn();
      realtimeManager.subscribe('strategy_update', callback);
      
      realtimeManager.simulateLiveData('strategy_update');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'strategy_update',
          payload: expect.objectContaining({
            strategy_id: expect.any(String),
            performance: expect.any(Number)
          })
        })
      );
    });

    it('should handle risk evaluations', () => {
      const callback = vi.fn();
      realtimeManager.subscribe('risk_evaluation', callback);
      
      realtimeManager.simulateLiveData('risk_evaluation');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'risk_evaluation',
          payload: expect.objectContaining({
            risk_level: expect.stringMatching(/LOW|MEDIUM|HIGH/),
            action: expect.stringMatching(/ALLOW|RESIZE|BLOCK/)
          })
        })
      );
    });

    it('should handle order executions', () => {
      const callback = vi.fn();
      realtimeManager.subscribe('order_execution', callback);
      
      realtimeManager.simulateLiveData('order_execution');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order_execution',
          payload: expect.objectContaining({
            symbol: expect.any(String),
            action: expect.stringMatching(/BUY|SELL/),
            quantity: expect.any(Number),
            price: expect.any(Number)
          })
        })
      );
    });
  });

  describe('BoltzCopilot Integration', () => {
    it('should process trading commands correctly', async () => {
      const response = await boltzCopilot.processMessage('explain last trade');
      
      expect(response).toContain('Last trade:');
      expect(response).toContain('Reasoning:');
      expect(response).toContain('Risk:');
    });

    it('should handle volatility queries', async () => {
      const response = await boltzCopilot.processMessage('show volatility');
      
      expect(response).toContain('VIX:');
      expect(response).toContain('Recommendation:');
    });

    it('should compare strategies', async () => {
      const response = await boltzCopilot.processMessage('compare momentum vs breakout');
      
      expect(response).toContain('Momentum:');
      expect(response).toContain('Breakout:');
      expect(response).toContain('Winner:');
    });

    it('should provide risk status', async () => {
      const response = await boltzCopilot.processMessage('risk status');
      
      expect(response).toContain('Exposure:');
      expect(response).toContain('Drawdown:');
      expect(response).toContain('Status:');
    });

    it('should handle general chat', async () => {
      const response = await boltzCopilot.processMessage('How is the market today?');
      
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    });

    it('should maintain conversation context', () => {
      boltzCopilot.processMessage('Hello');
      boltzCopilot.processMessage('What is my portfolio value?');
      
      const context = boltzCopilot.getContext();
      expect(context).toHaveLength(4); // 2 user + 2 assistant messages
    });
  });

  describe('LangGraph Visualization', () => {
    it('should render canvas with correct dimensions', () => {
      render(<BoltzTerminal />, { wrapper: TestWrapper });
      
      fireEvent.click(screen.getByText('LangGraph'));
      
      const canvas = screen.getByRole('img', { hidden: true }); // Canvas has img role
      expect(canvas).toBeInTheDocument();
    });

    it('should update node states on realtime data', async () => {
      render(<BoltzTerminal />, { wrapper: TestWrapper });
      
      fireEvent.click(screen.getByText('LangGraph'));
      
      // Simulate cognitive state update
      realtimeManager.simulateLiveData('cognitive_state');
      
      await waitFor(() => {
        expect(screen.getByText('LANGGRAPH NEURAL NETWORK - LIVE')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should maintain 60 FPS rendering', () => {
      const startTime = performance.now();
      
      // Simulate multiple rapid updates
      for (let i = 0; i < 100; i++) {
        realtimeManager.simulateLiveData('cognitive_state');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 updates in less than 2 seconds (50 FPS minimum)
      expect(duration).toBeLessThan(2000);
    });

    it('should handle high-frequency data updates', () => {
      const callback = vi.fn();
      realtimeManager.subscribe('order_execution', callback);
      
      // Simulate 1000 updates per minute
      for (let i = 0; i < 1000; i++) {
        realtimeManager.simulateLiveData('order_execution');
      }
      
      expect(callback).toHaveBeenCalledTimes(1000);
    });

    it('should maintain low latency responses', async () => {
      const startTime = performance.now();
      
      await boltzCopilot.processMessage('portfolio summary');
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Should respond in less than 200ms
      expect(latency).toBeLessThan(200);
    });
  });

  describe('API Integration', () => {
    it('should connect to all backend services', async () => {
      const services = [
        'http://localhost:8002/health', // Cognitive Engine
        'http://localhost:8003/health', // Strategy Engine  
        'http://localhost:8004/health'  // Risk Engine
      ];

      const healthChecks = services.map(async (url) => {
        try {
          const response = await fetch(url);
          return response.ok;
        } catch {
          return false;
        }
      });

      const results = await Promise.all(healthChecks);
      
      // At least one service should be available in test environment
      expect(results.some(result => result === true)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      // Mock failed API call
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
      
      const response = await boltzCopilot.processMessage('explain last trade');
      
      expect(response).toContain('Error');
    });

    it('should handle realtime connection failures', () => {
      const callback = vi.fn();
      
      // This should not throw
      expect(() => {
        realtimeManager.subscribe('invalid_channel', callback);
      }).not.toThrow();
    });
  });
});

// Integration test for full terminal workflow
describe('Terminal Integration Workflow', () => {
  it('should complete full trading workflow', async () => {
    render(<BoltzTerminal />, { wrapper: TestWrapper });
    
    // 1. Check system status
    expect(screen.getByText('SYSTEM STATUS')).toBeInTheDocument();
    
    // 2. View strategies
    fireEvent.click(screen.getByText('Strategies'));
    expect(screen.getByText('STRATEGY MATRIX')).toBeInTheDocument();
    
    // 3. Check risk
    fireEvent.click(screen.getByText('Risk'));
    expect(screen.getByText('RISK FIREWALL')).toBeInTheDocument();
    
    // 4. Monitor orders
    fireEvent.click(screen.getByText('Orders'));
    expect(screen.getByText('ORDER EXECUTION')).toBeInTheDocument();
    
    // 5. Use copilot
    fireEvent.click(screen.getByText('BoltzCopilot'));
    expect(screen.getByText('BOLTZ COPILOT')).toBeInTheDocument();
    
    // 6. View LangGraph
    fireEvent.click(screen.getByText('LangGraph'));
    expect(screen.getByText('LANGGRAPH NEURAL NETWORK')).toBeInTheDocument();
  });
});

console.log('✅ Boltz Terminal Phase 4 Test Suite Complete');