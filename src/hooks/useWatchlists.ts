import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '@/services/api';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export const useWatchlists = (userId: string) => {
  return useQuery({
    queryKey: ['watchlists', userId],
    queryFn: () => watchlistApi.getByUserId(userId),
    enabled: !!userId
  });
};

export const useCreateWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (watchlist: TablesInsert<'watchlists'>) => watchlistApi.create(watchlist),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists', variables.user_id] });
    }
  });
};

export const useUpdateWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'watchlists'> }) => 
      watchlistApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    }
  });
};

export const useDeleteWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => watchlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    }
  });
};