import { create } from 'zustand';
import { AISignal, MarketData, StreamStatus } from '@/services/streaming/signalTypes';

interface MarketStore {
  marketData: Record<string, MarketData>;
  aiSignals: AISignal[];
  streamStatus: StreamStatus;
  connectedSymbols: string[];
  
  // Actions
  setMarketData: (symbol: string, data: Partial<MarketData>) => void;
  setAISignals: (signals: AISignal[]) => void;
  addAISignal: (signal: AISignal) => void;
  setStreamStatus: (status: StreamStatus) => void;
  addConnectedSymbol: (symbol: string) => void;
  removeConnectedSymbol: (symbol: string) => void;
  clearMarketData: () => void;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  marketData: {},
  aiSignals: [],
  streamStatus: 'DISCONNECTED',
  connectedSymbols: [],

  setMarketData: (symbol: string, data: Partial<MarketData>) =>
    set((state) => {
      const existing = state.marketData[symbol];
      const timestamp = new Date().toISOString();
      
      const newData: MarketData = {
        symbol,
        price: data.price ?? existing?.price ?? 0,
        change: data.change ?? existing?.change ?? 0,
        volume: data.volume ?? existing?.volume ?? 0,
        timestamp,
        history: existing?.history ?? []
      };

      // Add to history if price changed
      if (data.price && data.price !== existing?.price) {
        newData.history = [
          ...newData.history.slice(-99), // Keep last 100 points
          {
            time: timestamp,
            price: data.price,
            volume: data.volume ?? 0
          }
        ];
      }

      return {
        marketData: {
          ...state.marketData,
          [symbol]: newData
        }
      };
    }),

  setAISignals: (signals: AISignal[]) => set({ aiSignals: signals }),

  addAISignal: (signal: AISignal) =>
    set((state) => ({
      aiSignals: [signal, ...state.aiSignals.slice(0, 49)] // Keep last 50 signals
    })),

  setStreamStatus: (status: StreamStatus) => set({ streamStatus: status }),

  addConnectedSymbol: (symbol: string) =>
    set((state) => ({
      connectedSymbols: [...new Set([...state.connectedSymbols, symbol])]
    })),

  removeConnectedSymbol: (symbol: string) =>
    set((state) => ({
      connectedSymbols: state.connectedSymbols.filter(s => s !== symbol)
    })),

  clearMarketData: () => set({
    marketData: {},
    aiSignals: [],
    connectedSymbols: []
  })
}));