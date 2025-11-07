import { useMarketStore } from '@/store/marketStore';
import { logAudit } from '@/utils/auditLogger';
import { StreamConfig } from './signalTypes';

// Mock WebSocket service - replace with real Binance WebSocket
class MockMarketStream {
  private intervals: NodeJS.Timeout[] = [];
  private isActive = false;

  start(config: StreamConfig) {
    if (this.isActive) return;
    
    this.isActive = true;
    const { setMarketData, setStreamStatus, addConnectedSymbol } = useMarketStore.getState();
    
    setStreamStatus('CONNECTING');
    
    // Mock connection delay
    setTimeout(() => {
      setStreamStatus('CONNECTED');
      console.log('✅ Mock market stream connected');
      
      config.symbols.forEach(symbol => {
        addConnectedSymbol(symbol);
        
        // Generate mock real-time data
        const interval = setInterval(() => {
          const basePrice = this.getBasePrice(symbol);
          const change = (Math.random() - 0.5) * 4; // -2% to +2%
          const price = basePrice * (1 + change / 100);
          const volume = Math.random() * 1000000;
          
          setMarketData(symbol, {
            price,
            change,
            volume,
            timestamp: new Date().toISOString()
          });
        }, 2000 + Math.random() * 3000); // 2-5 second intervals
        
        this.intervals.push(interval);
      });
      
      logAudit('market_stream', 'MOCK_BINANCE', 'CONNECTED', 'System', { 
        symbols: config.symbols 
      });
    }, 1000);
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    
    const { setStreamStatus, clearMarketData } = useMarketStore.getState();
    setStreamStatus('DISCONNECTED');
    
    console.log('⚠️ Mock market stream disconnected');
    logAudit('market_stream', 'MOCK_BINANCE', 'DISCONNECTED', 'System', {});
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'BTCUSDT': 45000,
      'ETHUSDT': 2500,
      'SOLUSDT': 100,
      'NIFTY50': 18500,
      'SP500': 4500
    };
    return prices[symbol] || 1000;
  }
}

const mockStream = new MockMarketStream();

export function startMarketStreaming(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']) {
  const config: StreamConfig = {
    symbols,
    endpoint: 'wss://stream.binance.com:9443/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5
  };
  
  mockStream.start(config);
}

export function stopMarketStreaming() {
  mockStream.stop();
}

export function getStreamStatus() {
  return useMarketStore.getState().streamStatus;
}

// Real WebSocket implementation (commented for now)
/*
export function startRealMarketStreaming(symbols: string[]) {
  const BINANCE_WS = 'wss://stream.binance.com:9443/ws';
  const { setMarketData, setStreamStatus } = useMarketStore.getState();
  
  symbols.forEach(symbol => {
    const ws = new WebSocket(`${BINANCE_WS}/${symbol.toLowerCase()}@ticker`);
    
    ws.onopen = () => {
      console.log(`✅ Connected to ${symbol} stream`);
      setStreamStatus('CONNECTED');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarketData(symbol, {
        price: parseFloat(data.c),
        change: parseFloat(data.P),
        volume: parseFloat(data.v)
      });
    };
    
    ws.onerror = (error) => {
      console.error(`❌ ${symbol} stream error:`, error);
      setStreamStatus('ERROR');
    };
    
    ws.onclose = () => {
      console.warn(`⚠️ ${symbol} stream closed`);
      setStreamStatus('DISCONNECTED');
    };
  });
}
*/