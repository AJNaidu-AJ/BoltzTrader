import { useMutation, useQuery } from '@tanstack/react-query';
import { explanationService } from '@/services/explanationApi';

export const useExplainSignal = () => {
  return useMutation({
    mutationFn: (request: {
      symbol: string;
      action?: string;
      ruleMatches: Array<{
        name: string;
        value: string;
        weight?: number;
      }>;
    }) => explanationService.explainSignal(request)
  });
};

export const useSignalExplanation = (signalId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['explanation', signalId],
    queryFn: async () => {
      // This would fetch cached explanation from database
      // For now, return null to trigger fresh explanation
      return null;
    },
    enabled
  });
};