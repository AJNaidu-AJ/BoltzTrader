import { useMarketStore } from '@/store/marketStore';
import { AISignal, SignalStatus } from './signalTypes';
import { logAudit } from '@/utils/auditLogger';

export function applyAISignalOverlay(symbol: string): AISignal | null {
  const { marketData, aiSignals } = useMarketStore.getState();
  const latest = marketData[symbol];

  if (!latest) return null;

  // Find existing signal or create new one
  let signal = aiSignals.find(s => s.symbol === symbol);
  
  if (!signal) {
    signal = {
      id: `signal_${symbol}_${Date.now()}`,
      symbol,
      status: 'HOLD',
      confidence: 0.5,
      timestamp: new Date().toISOString(),
      price: latest.price,
      source: 'AI_OVERLAY'
    };
  }

  // AI Signal Logic (Mock)
  const newStatus = generateAISignal(latest.change, latest.price, latest.volume);
  const confidence = calculateConfidence(latest.change, latest.volume);

  if (newStatus !== signal.status) {
    signal = {
      ...signal,
      status: newStatus,
      confidence,
      timestamp: new Date().toISOString(),
      price: latest.price
    };

    // Add to store
    useMarketStore.getState().addAISignal(signal);

    // Log AI feedback for learning system
    logAuditAISignal(signal);
  }

  return signal;
}

function generateAISignal(change: number, price: number, volume: number): SignalStatus {
  // Mock AI logic - replace with real AI model
  const volatility = Math.abs(change);
  const volumeScore = volume > 500000 ? 1 : 0.5;
  
  if (change > 2 && volatility < 5 && volumeScore > 0.7) {
    return 'BUY';
  } else if (change < -2 && volatility < 5 && volumeScore > 0.7) {
    return 'SELL';
  } else {
    return 'HOLD';
  }
}

function calculateConfidence(change: number, volume: number): number {
  const changeScore = Math.min(Math.abs(change) / 5, 1); // Max confidence at 5% change
  const volumeScore = Math.min(volume / 1000000, 1); // Max confidence at 1M volume
  
  return Math.min((changeScore + volumeScore) / 2, 0.95); // Max 95% confidence
}

async function logAuditAISignal(signal: AISignal) {
  try {
    await logAudit('ai_feedback', signal.symbol, signal.status, 'AI_OVERLAY', {
      timestamp: signal.timestamp,
      source: 'Phase9.3-Overlay',
      confidence: signal.confidence,
      price: signal.price
    });
  } catch (error) {
    console.error('Failed to log AI signal audit:', error);
  }
}

export function getActiveSignals(): AISignal[] {
  return useMarketStore.getState().aiSignals;
}

export function getSignalForSymbol(symbol: string): AISignal | undefined {
  return useMarketStore.getState().aiSignals.find(s => s.symbol === symbol);
}