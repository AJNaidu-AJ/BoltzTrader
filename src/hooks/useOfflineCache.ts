import { useState, useEffect } from 'react';
import { mobileService } from '@/services/mobileService';

interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  fallbackData?: any;
}

export const useOfflineCache = <T>(config: CacheConfig) => {
  const [data, setData] = useState<T | null>(config.fallbackData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Network status listener
    const unsubscribe = mobileService.onNetworkChange(setIsOnline);
    
    // Load cached data on mount
    loadCachedData();

    return unsubscribe;
  }, [config.key]);

  const loadCachedData = async () => {
    try {
      const cached = localStorage.getItem(`cache_${config.key}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid
        if (!config.ttl || Date.now() - timestamp < config.ttl) {
          setData(cachedData);
          setLastUpdated(new Date(timestamp));
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const cacheData = async (newData: T) => {
    try {
      const cacheEntry = {
        data: newData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`cache_${config.key}`, JSON.stringify(cacheEntry));
      setData(newData);
      setLastUpdated(new Date());

      // Also cache in mobile app if available
      if (mobileService.isMobile()) {
        await mobileService.cacheData({ [config.key]: newData });
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const fetchData = async (fetchFn: () => Promise<T>) => {
    setIsLoading(true);
    
    try {
      if (isOnline) {
        const newData = await fetchFn();
        await cacheData(newData);
        return newData;
      } else {
        // Return cached data when offline
        return data;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Return cached data on error
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(`cache_${config.key}`);
    setData(config.fallbackData || null);
    setLastUpdated(null);
  };

  const isCacheExpired = () => {
    if (!lastUpdated || !config.ttl) return false;
    return Date.now() - lastUpdated.getTime() > config.ttl;
  };

  return {
    data,
    isLoading,
    isOnline,
    lastUpdated,
    fetchData,
    cacheData,
    clearCache,
    isCacheExpired
  };
};