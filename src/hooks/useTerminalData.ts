import { useState, useEffect } from 'react';
import { realtimeManager, RealtimeData } from '@/lib/realtime';
import { cognitiveApi } from '@/services/cognitiveApi';
import { strategyApi } from '@/services/strategyApi';
import { riskApi } from '@/services/riskApi';

export interface TerminalState {
  systemStatus: 'online' | 'offline' | 'degraded';
  activeStrategies: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dailyPnL: number;
  portfolioValue: number;
  uptime: number;
  latency: number;
  errorRate: number;
}

export interface LiveOrder {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  timestamp: string;
}

export const useTerminalData = () => {
  const [terminalState, setTerminalState] = useState<TerminalState>({
    systemStatus: 'online',
    activeStrategies: 4,
    riskLevel: 'MEDIUM',
    dailyPnL: 2847,
    portfolioValue: 250000,
    uptime: 99.9,
    latency: 45,
    errorRate: 0.01
  });

  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    // Strategy updates
    realtimeManager.subscribe('strategy_update', (data: RealtimeData) => {
      setStrategies(prev => prev.map(strategy => 
        strategy.id === data.payload.strategy_id 
          ? { ...strategy, performance: data.payload.performance, sharpe_ratio: data.payload.sharpe_ratio }
          : strategy
      ));
    });

    // Risk evaluations
    realtimeManager.subscribe('risk_evaluation', (data: RealtimeData) => {
      setRiskMetrics(prev => ({
        ...prev,
        risk_level: data.payload.risk_level,
        last_evaluation: data.timestamp
      }));
      
      setTerminalState(prev => ({
        ...prev,
        riskLevel: data.payload.risk_level
      }));
    });

    // Order executions
    realtimeManager.subscribe('order_execution', (data: RealtimeData) => {
      const newOrder: LiveOrder = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: data.payload.symbol,
        action: data.payload.action,
        quantity: data.payload.quantity,
        price: data.payload.price,
        status: data.payload.status,
        timestamp: data.timestamp
      };

      setLiveOrders(prev => [newOrder, ...prev.slice(0, 9)]); // Keep last 10 orders

      // Update P&L simulation
      if (data.payload.status === 'FILLED') {
        const pnlChange = (Math.random() - 0.5) * 1000;
        setTerminalState(prev => ({
          ...prev,
          dailyPnL: prev.dailyPnL + pnlChange
        }));
      }
    });

    // Simulate live data
    const intervals = [
      setInterval(() => realtimeManager.simulateLiveData('strategy_update'), 3000),
      setInterval(() => realtimeManager.simulateLiveData('risk_evaluation'), 5000),
      setInterval(() => realtimeManager.simulateLiveData('order_execution'), 7000)
    ];

    return () => {
      realtimeManager.unsubscribe('strategy_update');
      realtimeManager.unsubscribe('risk_evaluation');
      realtimeManager.unsubscribe('order_execution');
      intervals.forEach(clearInterval);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      // Load strategies
      const strategiesData = await strategyApi.getStrategies();
      setStrategies(strategiesData.strategies || [
        { id: 'momentum_v1', name: 'Momentum', confidence: 0.85, status: 'ACTIVE' },
        { id: 'mean_reversion_v1', name: 'Mean Reversion', confidence: 0.72, status: 'ACTIVE' },
        { id: 'breakout_v1', name: 'Breakout', confidence: 0.68, status: 'ACTIVE' },
        { id: 'sentiment_fusion_v1', name: 'Sentiment Fusion', confidence: 0.91, status: 'ACTIVE' }
      ]);

      // Load risk metrics
      const riskData = await riskApi.getStats();
      setRiskMetrics(riskData);

      // Update system status based on API health
      setTerminalState(prev => ({
        ...prev,
        systemStatus: 'online',
        activeStrategies: strategiesData.strategies?.length || 4
      }));

    } catch (error) {
      console.error('Failed to load initial data:', error);
      setTerminalState(prev => ({
        ...prev,
        systemStatus: 'degraded'
      }));
    }
  };

  // System health monitoring
  useEffect(() => {
    const healthCheck = setInterval(async () => {
      try {
        // Simulate health checks to all services
        const healthPromises = [
          fetch('http://localhost:8002/health').catch(() => ({ ok: false })),
          fetch('http://localhost:8003/health').catch(() => ({ ok: false })),
          fetch('http://localhost:8004/health').catch(() => ({ ok: false }))
        ];

        const results = await Promise.all(healthPromises);
        const healthyServices = results.filter(r => r.ok).length;
        
        setTerminalState(prev => ({
          ...prev,
          systemStatus: healthyServices === 3 ? 'online' : healthyServices > 0 ? 'degraded' : 'offline',
          latency: Math.random() * 50 + 20, // Simulate latency
          errorRate: Math.random() * 0.05 // Simulate error rate
        }));

      } catch (error) {
        setTerminalState(prev => ({
          ...prev,
          systemStatus: 'offline'
        }));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheck);
  }, []);

  return {
    terminalState,
    liveOrders,
    strategies,
    riskMetrics,
    refreshData: loadInitialData
  };
};