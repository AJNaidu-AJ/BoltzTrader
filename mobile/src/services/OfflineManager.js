import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

class OfflineManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.db = SQLite.openDatabase('boltztrader.db');
      await this.createTables();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize offline manager:', error);
    }
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        // Signals cache table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS cached_signals (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
          );
        `);

        // Charts cache table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS cached_charts (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            timeframe TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
          );
        `);

        // Market data cache table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS cached_market_data (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
          );
        `);

        // User preferences
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS user_preferences (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);
      }, reject, resolve);
    });
  }

  async cacheSignals(signals) {
    if (!this.isInitialized) await this.initialize();

    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        signals.forEach(signal => {
          tx.executeSql(
            'INSERT OR REPLACE INTO cached_signals (id, symbol, data, timestamp, expires_at) VALUES (?, ?, ?, ?, ?)',
            [signal.id, signal.symbol, JSON.stringify(signal), Date.now(), expiresAt]
          );
        });
      }, reject, resolve);
    });
  }

  async getCachedSignals(symbol = null) {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      const query = symbol 
        ? 'SELECT * FROM cached_signals WHERE symbol = ? AND expires_at > ?'
        : 'SELECT * FROM cached_signals WHERE expires_at > ?';
      
      const params = symbol ? [symbol, Date.now()] : [Date.now()];

      this.db.transaction(tx => {
        tx.executeSql(query, params, (_, { rows }) => {
          const signals = rows._array.map(row => ({
            ...JSON.parse(row.data),
            cached: true
          }));
          resolve(signals);
        });
      }, reject);
    });
  }

  async cacheChartData(symbol, timeframe, chartData) {
    if (!this.isInitialized) await this.initialize();

    const id = `${symbol}_${timeframe}`;
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO cached_charts (id, symbol, timeframe, data, timestamp, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, symbol, timeframe, JSON.stringify(chartData), Date.now(), expiresAt]
        );
      }, reject, resolve);
    });
  }

  async getCachedChartData(symbol, timeframe) {
    if (!this.isInitialized) await this.initialize();

    const id = `${symbol}_${timeframe}`;

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cached_charts WHERE id = ? AND expires_at > ?',
          [id, Date.now()],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(JSON.parse(rows._array[0].data));
            } else {
              resolve(null);
            }
          }
        );
      }, reject);
    });
  }

  async cacheMarketData(marketData) {
    if (!this.isInitialized) await this.initialize();

    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        marketData.forEach(data => {
          tx.executeSql(
            'INSERT OR REPLACE INTO cached_market_data (id, symbol, data, timestamp, expires_at) VALUES (?, ?, ?, ?, ?)',
            [data.symbol, data.symbol, JSON.stringify(data), Date.now(), expiresAt]
          );
        });
      }, reject, resolve);
    });
  }

  async getCachedMarketData() {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cached_market_data WHERE expires_at > ?',
          [Date.now()],
          (_, { rows }) => {
            const marketData = rows._array.map(row => JSON.parse(row.data));
            resolve(marketData);
          }
        );
      }, reject);
    });
  }

  async cacheData(data) {
    try {
      if (data.signals) {
        await this.cacheSignals(data.signals);
      }
      if (data.chartData) {
        await this.cacheChartData(data.chartData.symbol, data.chartData.timeframe, data.chartData.data);
      }
      if (data.marketData) {
        await this.cacheMarketData(data.marketData);
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  async getCachedData() {
    try {
      const [signals, marketData] = await Promise.all([
        this.getCachedSignals(),
        this.getCachedMarketData()
      ]);

      return {
        signals,
        marketData,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  async clearExpiredCache() {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        const now = Date.now();
        tx.executeSql('DELETE FROM cached_signals WHERE expires_at < ?', [now]);
        tx.executeSql('DELETE FROM cached_charts WHERE expires_at < ?', [now]);
        tx.executeSql('DELETE FROM cached_market_data WHERE expires_at < ?', [now]);
      }, reject, resolve);
    });
  }

  async saveUserPreference(key, value) {
    try {
      await AsyncStorage.setItem(`pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  }

  async getUserPreference(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(`pref_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Error getting preference:', error);
      return defaultValue;
    }
  }
}

export const offlineManager = new OfflineManager();
export { OfflineManager };