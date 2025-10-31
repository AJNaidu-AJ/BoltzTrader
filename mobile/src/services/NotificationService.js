import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.requestPermissions();
      await this.registerForPushNotifications();
      this.setupNotificationListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }
      
      return true;
    } else {
      console.warn('Must use physical device for Push Notifications');
      return false;
    }
  }

  async registerForPushNotifications() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'boltztrader-mobile'
        });
        this.expoPushToken = token.data;
        console.log('Expo push token:', this.expoPushToken);
        
        // Send token to backend
        await this.sendTokenToBackend(this.expoPushToken);
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    }
  }

  async sendTokenToBackend(token) {
    try {
      // Replace with your backend endpoint
      const response = await fetch('https://your-backend.com/api/push-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: Device.deviceName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register push token');
      }
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  setupNotificationListeners() {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    
    if (data.type === 'signal_alert') {
      // Navigate to signals page
      console.log('Navigate to signal:', data.signalId);
    } else if (data.type === 'price_alert') {
      // Navigate to watchlist
      console.log('Navigate to price alert:', data.symbol);
    } else if (data.type === 'trade_update') {
      // Navigate to trading page
      console.log('Navigate to trade update:', data.tradeId);
    }
  }

  async sendLocalNotification(notification) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: notification.delay ? { seconds: notification.delay } : null,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async scheduleSignalAlert(signal) {
    await this.sendLocalNotification({
      title: `New ${signal.rank.toUpperCase()} Signal`,
      body: `${signal.symbol} - ${signal.confidence}% confidence`,
      data: {
        type: 'signal_alert',
        signalId: signal.id,
        symbol: signal.symbol
      }
    });
  }

  async schedulePriceAlert(symbol, currentPrice, targetPrice) {
    const direction = currentPrice > targetPrice ? 'above' : 'below';
    
    await this.sendLocalNotification({
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

  async scheduleTradeUpdate(trade) {
    await this.sendLocalNotification({
      title: 'Trade Update',
      body: `${trade.symbol} ${trade.side} order ${trade.status}`,
      data: {
        type: 'trade_update',
        tradeId: trade.id,
        symbol: trade.symbol
      }
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotification(identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
export { NotificationService };