import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfflineManager } from './src/services/OfflineManager';
import { NotificationService } from './src/services/NotificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedData, setCachedData] = useState(null);
  
  const webAppUrl = 'https://boltztrader.vercel.app';
  const localUrl = 'http://localhost:5173';

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await NotificationService.initialize();
    await OfflineManager.initialize();
    
    // Load cached data
    const cached = await OfflineManager.getCachedData();
    setCachedData(cached);
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'CACHE_DATA':
          await OfflineManager.cacheData(data.payload);
          break;
        case 'SEND_NOTIFICATION':
          await NotificationService.sendLocalNotification(data.payload);
          break;
        case 'REQUEST_PERMISSIONS':
          await NotificationService.requestPermissions();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const injectedJavaScript = `
    // Mobile app detection
    window.isMobileApp = true;
    
    // Offline detection
    window.addEventListener('online', () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'NETWORK_STATUS',
        payload: { isOnline: true }
      }));
    });
    
    window.addEventListener('offline', () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'NETWORK_STATUS',
        payload: { isOnline: false }
      }));
    });
    
    // Cache management
    window.cacheData = (data) => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CACHE_DATA',
        payload: data
      }));
    };
    
    // Notification helpers
    window.sendNotification = (notification) => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SEND_NOTIFICATION',
        payload: notification
      }));
    };
    
    window.requestNotificationPermissions = () => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'REQUEST_PERMISSIONS'
      }));
    };
    
    true;
  `;

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <WebView
          source={{ uri: webAppUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onError={(error) => {
            console.error('WebView error:', error);
            Alert.alert('Connection Error', 'Unable to load BoltzTrader. Please check your internet connection.');
          }}
          onHttpError={(error) => {
            console.error('HTTP error:', error);
          }}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
        />
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});