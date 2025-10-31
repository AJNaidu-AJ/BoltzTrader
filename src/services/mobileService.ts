interface MobileNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  delay?: number;
}

interface CacheData {
  signals?: any[];
  chartData?: {
    symbol: string;
    timeframe: string;
    data: any;
  };
  marketData?: any[];
}

class MobileService {
  private isMobileApp = false;

  constructor() {
    this.detectMobileApp();
  }

  private detectMobileApp(): void {
    // Check if running in mobile app WebView
    this.isMobileApp = !!(window as any).isMobileApp || 
                      !!(window as any).ReactNativeWebView ||
                      navigator.userAgent.includes('BoltzTrader');
  }

  isMobile(): boolean {
    return this.isMobileApp;
  }

  async cacheData(data: CacheData): Promise<void> {
    if (!this.isMobileApp) return;

    try {
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CACHE_DATA',
          payload: data
        }));
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  async sendNotification(notification: MobileNotification): Promise<void> {
    if (!this.isMobileApp) return;

    try {
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SEND_NOTIFICATION',
          payload: notification
        }));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async requestNotificationPermissions(): Promise<void> {
    if (!this.isMobileApp) return;

    try {
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'REQUEST_PERMISSIONS'
        }));
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  async cacheSignals(signals: any[]): Promise<void> {
    await this.cacheData({ signals });
  }

  async cacheChartData(symbol: string, timeframe: string, data: any): Promise<void> {
    await this.cacheData({
      chartData: { symbol, timeframe, data }
    });
  }

  async cacheMarketData(marketData: any[]): Promise<void> {
    await this.cacheData({ marketData });
  }

  async sendSignalAlert(signal: any): Promise<void> {
    await this.sendNotification({
      title: `New ${signal.rank.toUpperCase()} Signal`,
      body: `${signal.symbol} - ${signal.confidence}% confidence`,
      data: {
        type: 'signal_alert',
        signalId: signal.id,
        symbol: signal.symbol
      }
    });
  }

  async sendPriceAlert(symbol: string, currentPrice: number, targetPrice: number): Promise<void> {
    const direction = currentPrice > targetPrice ? 'above' : 'below';
    
    await this.sendNotification({
      title: `Price Alert: ${symbol}`,
      body: `${symbol} is now ${direction} $${targetPrice} at $${currentPrice}`,
      data: {
        type: 'price_alert',
        symbol,
        currentPrice,
        targetPrice
      }
    });
  }

  async sendTradeUpdate(trade: any): Promise<void> {
    await this.sendNotification({
      title: 'Trade Update',
      body: `${trade.symbol} ${trade.side} order ${trade.status}`,
      data: {
        type: 'trade_update',
        tradeId: trade.id,
        symbol: trade.symbol
      }
    });
  }

  // Offline detection
  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Mobile-specific UI adjustments
  getMobileStyles(): Record<string, string> {
    if (!this.isMobileApp) return {};

    return {
      fontSize: '16px', // Prevent zoom on iOS
      touchAction: 'manipulation', // Improve touch responsiveness
      userSelect: 'none', // Prevent text selection
      webkitTouchCallout: 'none', // Disable callout on iOS
      webkitUserSelect: 'none',
      webkitTapHighlightColor: 'transparent'
    };
  }

  // Haptic feedback (if supported)
  vibrate(pattern: number | number[] = 100): void {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  // Screen orientation
  async lockOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
    if ('screen' in window && 'orientation' in window.screen) {
      try {
        await (window.screen.orientation as any).lock(orientation);
      } catch (error) {
        console.warn('Screen orientation lock not supported:', error);
      }
    }
  }
}

export const mobileService = new MobileService();
export type { MobileNotification, CacheData };