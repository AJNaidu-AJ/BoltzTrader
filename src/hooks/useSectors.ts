import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectorApi } from '@/services/api';
import type { TablesUpdate } from '@/integrations/supabase/types';

export const useSectors = () => {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: () => sectorApi.getAll()
  });
};

export const useSector = (id: string) => {
  return useQuery({
    queryKey: ['sector', id],
    queryFn: () => sectorApi.getById(id),
    enabled: !!id
  });
};

export const useUpdateSector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'sectors'> }) => 
      sectorApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    }
  });
};