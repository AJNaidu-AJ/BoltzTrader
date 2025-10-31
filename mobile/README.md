# BoltzTrader Mobile App

React Native mobile app wrapper for BoltzTrader web application with offline caching and native push notifications.

## Features

- **WebView Wrapper**: Wraps the web app in a native container
- **Offline Caching**: SQLite-based caching for signals, charts, and market data
- **Push Notifications**: Native notifications using Expo Notifications
- **Network Detection**: Automatic offline/online mode switching
- **Native Integration**: Haptic feedback, orientation lock, and mobile optimizations

## Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Configure Firebase (for push notifications):
   - Replace `firebase.json` with your Firebase project configuration
   - Update project ID in `app.json`

3. Start development server:
```bash
npm start
```

4. Run on device/simulator:
```bash
npm run ios     # iOS simulator
npm run android # Android emulator
```

## Build for Production

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build for app stores:
```bash
eas build --platform all
```

## Offline Caching

The app automatically caches:
- Trading signals (24 hour TTL)
- Chart data (1 hour TTL)
- Market data (5 minute TTL)
- User preferences (persistent)

Data is stored in SQLite and automatically synced when online.

## Push Notifications

Supports native push notifications for:
- New trading signals
- Price alerts
- Trade updates
- Market news

Notifications are handled by Expo Notifications with Firebase backend integration.

## Architecture

```
mobile/
├── App.js                 # Main React Native app
├── src/
│   └── services/
│       ├── OfflineManager.js    # SQLite caching
│       └── NotificationService.js # Push notifications
├── app.json              # Expo configuration
├── firebase.json         # Firebase configuration
└── package.json          # Dependencies
```

## Web App Integration

The web app detects mobile environment and uses:
- `mobileService.ts` - Communication bridge
- `useOfflineCache.ts` - Offline data management
- `OfflineIndicator.tsx` - Network status UI
- `MobileOptimized.tsx` - Mobile-specific optimizations