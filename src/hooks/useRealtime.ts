import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '@/services/realtime';

export const useRealtimeSignals = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = realtimeService.subscribeToSignals(() => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    });

    return () => {
      realtimeService.unsubscribe('signals');
    };
  }, [queryClient]);
};

export const useRealtimeSectors = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = realtimeService.subscribeToSectors(() => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    });

    return () => {
      realtimeService.unsubscribe('sectors');
    };
  }, [queryClient]);
};

export const useRealtimeNotifications = (userId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = realtimeService.subscribeToNotifications(userId, () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    });

    return () => {
      realtimeService.unsubscribe(`notifications-${userId}`);
    };
  }, [queryClient, userId]);
};