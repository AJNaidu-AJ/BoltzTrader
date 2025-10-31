interface NotificationPreference {
  notification_type: string;
  enabled: boolean;
  delivery_methods: string[];
  conditions: Record<string, any>;
}

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async initialize() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.initialize();
    }

    if (!this.swRegistration) {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LdNiVfQUYiIdkwORaZhGzgvNNlOzTzS2WzZwZjlqOBGRv_x2SAI'
        )
      });

      // Send subscription to server
      await this.saveSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  }

  showLocalNotification(notification: PushNotification): void {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/placeholder.svg',
        badge: notification.badge || '/placeholder.svg',
        tag: notification.tag,
        data: notification.data
      });
    }
  }

  async sendTestNotification(): Promise<void> {
    this.showLocalNotification({
      title: 'BoltzTrader Alert',
      body: 'Test notification - your alerts are working!',
      tag: 'test'
    });
  }

  // Email notification (would integrate with backend)
  async sendEmailNotification(email: string, subject: string, content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, subject, content })
      });
      return response.ok;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  // Telegram notification (would integrate with backend)
  async sendTelegramNotification(chatId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, message })
      });
      return response.ok;
    } catch (error) {
      console.error('Telegram notification failed:', error);
      return false;
    }
  }

  // Signal-based notifications
  notifySignalMatch(signal: any, userProfile: any): void {
    const title = `New ${signal.rank} Signal: ${signal.symbol}`;
    const body = `${signal.company} - ${(signal.confidence * 100).toFixed(0)}% confidence`;
    
    this.showLocalNotification({
      title,
      body,
      tag: `signal-${signal.id}`,
      data: { signalId: signal.id, symbol: signal.symbol }
    });
  }

  // News-based notifications
  notifyBreakingNews(newsItem: any): void {
    const title = 'Breaking Market News';
    const body = newsItem.title;
    
    this.showLocalNotification({
      title,
      body,
      tag: `news-${newsItem.id}`,
      data: { newsId: newsItem.id, url: newsItem.url }
    });
  }

  // Price alert notifications
  notifyPriceAlert(symbol: string, price: number, condition: string): void {
    const title = `Price Alert: ${symbol}`;
    const body = `${symbol} ${condition} $${price.toFixed(2)}`;
    
    this.showLocalNotification({
      title,
      body,
      tag: `price-${symbol}`,
      data: { symbol, price, condition }
    });
  }
}

export const notificationService = new NotificationService();
export type { NotificationPreference, PushNotification };