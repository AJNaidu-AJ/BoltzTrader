import { useQuery, useMutation } from '@tanstack/react-query';
import { performanceService } from '@/services/performance';

export const usePerformanceMetrics = (userId: string) => {
  return useQuery({
    queryKey: ['performance', userId],
    queryFn: () => performanceService.calculateUserMetrics(userId),
    enabled: !!userId
  });
};

export const useHistoricalAccuracy = (timeframe: '1d' | '1w' | '1m' = '1d') => {
  return useQuery({
    queryKey: ['accuracy', timeframe],
    queryFn: () => performanceService.getHistoricalAccuracy(timeframe)
  });
};

export const useTrackPerformance = () => {
  return useMutation({
    mutationFn: ({ signalId, entryPrice, exitPrice }: { 
      signalId: string; 
      entryPrice: number; 
      exitPrice?: number; 
    }) => performanceService.trackSignalPerformance(signalId, entryPrice, exitPrice)
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: ({ userId, startDate, endDate }: { 
      userId: string; 
      startDate: string; 
      endDate: string; 
    }) => performanceService.generateReport(userId, startDate, endDate)
  });
};