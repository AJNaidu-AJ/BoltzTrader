import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalApi, symbolsApi } from '@/services/api';
import { marketDataService } from '@/services/marketData';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export const useSignals = (filters?: { sector?: string; rank?: string; assetType?: string; limit?: number }) => {
  return useQuery({
    queryKey: ['signals', filters],
    queryFn: () => signalApi.getAll(filters)
  });
};

export const useSignal = (id: string) => {
  return useQuery({
    queryKey: ['signal', id],
    queryFn: () => signalApi.getById(id),
    enabled: !!id
  });
};

export const useCreateSignal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (signal: TablesInsert<'signals'>) => signalApi.create(signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    }
  });
};

export const useUpdateSignal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'signals'> }) => 
      signalApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    }
  });
};

export const useSymbols = (assetType?: string) => {
  return useQuery({
    queryKey: ['symbols', assetType],
    queryFn: () => symbolsApi.getAll(assetType)
  });
};

export const useMarketData = (symbols: string[]) => {
  return useQuery({
    queryKey: ['marketData', symbols],
    queryFn: () => marketDataService.getMultiAssetData(symbols),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: symbols.length > 0
  });
};