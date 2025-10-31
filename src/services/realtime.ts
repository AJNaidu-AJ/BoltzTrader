import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { notificationService } from './notifications';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  subscribeToSignals(callback: (payload: any) => void) {
    const channel = supabase
      .channel('signals-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'signals' }, 
        (payload) => {
          this.handleSignalUpdate(payload);
          callback(payload);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.connectionStatus = 'connected';
        } else if (status === 'CLOSED') {
          this.handleDisconnection('signals');
        }
      });

    this.channels.set('signals', channel);
    return channel;
  }

  subscribeToSectors(callback: (payload: any) => void) {
    const channel = supabase
      .channel('sectors-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sectors' }, 
        callback
      )
      .subscribe();

    this.channels.set('sectors', channel);
    return channel;
  }

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();

    this.channels.set(`notifications-${userId}`, channel);
    return channel;
  }

  subscribeToMarketData(symbols: string[], callback: (data: any) => void) {
    const interval = setInterval(() => {
      symbols.forEach(symbol => {
        callback({
          symbol,
          price: 100 + Math.random() * 50,
          change: (Math.random() - 0.5) * 10,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: Date.now()
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }

  private handleSignalUpdate(payload: any) {
    if (payload.eventType === 'INSERT' && payload.new?.confidence > 80) {
      this.broadcastHighConfidenceSignal(payload.new);
    }
  }

  private async broadcastHighConfidenceSignal(signal: any) {
    const { data: users } = await supabase
      .from('user_preferences')
      .select('user_id')
      .contains('alert_settings', { high_confidence_signals: true });

    users?.forEach(user => {
      notificationService.sendSignalAlert(signal, user.user_id);
    });
  }

  private handleDisconnection(channelName: string) {
    this.connectionStatus = 'disconnected';
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.connectionStatus = 'reconnecting';
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.reconnectChannel(channelName);
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  private reconnectChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.subscribe();
    }
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();