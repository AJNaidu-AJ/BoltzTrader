import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

interface NotificationPayload {
  title: string;
  content: string;
  type: string;
  userId: string;
  signalId?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  async sendNotification(payload: NotificationPayload) {
    const notification: TablesInsert<'notifications'> = {
      title: payload.title,
      content: payload.content,
      type: payload.type,
      user_id: payload.userId,
      signal_id: payload.signalId,
      metadata: payload.metadata,
      channel: 'system',
      status: 'unread'
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (!error && this.shouldSendPush(payload.type)) {
      await this.sendPushNotification(payload);
    }

    return { data, error };
  }

  async sendSignalAlert(signal: any, userId: string) {
    return this.sendNotification({
      title: `New ${signal.rank.toUpperCase()} Signal`,
      content: `${signal.symbol} - ${signal.confidence}% confidence`,
      type: 'signal_alert',
      userId,
      signalId: signal.id,
      metadata: { symbol: signal.symbol, confidence: signal.confidence }
    });
  }

  async sendPriceAlert(symbol: string, price: number, targetPrice: number, userId: string) {
    const direction = price > targetPrice ? 'above' : 'below';
    return this.sendNotification({
      title: `Price Alert: ${symbol}`,
      content: `${symbol} is now ${direction} $${targetPrice} at $${price}`,
      type: 'price_alert',
      userId,
      metadata: { symbol, price, targetPrice }
    });
  }

  private shouldSendPush(type: string): boolean {
    return ['signal_alert', 'price_alert'].includes(type);
  }

  private async sendPushNotification(payload: NotificationPayload) {
    // Integration with push service (Firebase, Pusher, etc.)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(payload.title, {
          body: payload.content,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.type,
          data: payload.metadata
        });
      } catch (error) {
        console.error('Push notification failed:', error);
      }
    }
  }

  async sendWebhook(url: string, payload: any) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }
}

export const notificationService = new NotificationService();