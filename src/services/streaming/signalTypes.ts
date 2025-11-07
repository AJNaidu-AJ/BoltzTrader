export interface AISignal {
  id: string;
  symbol: string;
  status: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
  price: number;
  source: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: string;
  history: PricePoint[];
}

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

export interface StreamConfig {
  symbols: string[];
  endpoint: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export type SignalStatus = 'BUY' | 'SELL' | 'HOLD';
export type StreamStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';