import { useEffect } from 'react';
import { mobileService } from '@/services/mobileService';
import { OfflineIndicator } from './OfflineIndicator';

interface MobileOptimizedProps {
  children: React.ReactNode;
}

export const MobileOptimized = ({ children }: MobileOptimizedProps) => {
  useEffect(() => {
    if (mobileService.isMobile()) {
      // Apply mobile-specific styles
      const mobileStyles = mobileService.getMobileStyles();
      Object.assign(document.body.style, mobileStyles);

      // Request notification permissions
      mobileService.requestNotificationPermissions();

      // Lock to portrait orientation for mobile
      mobileService.lockOrientation('portrait');

      // Add mobile app class for CSS targeting
      document.body.classList.add('mobile-app');

      return () => {
        document.body.classList.remove('mobile-app');
      };
    }
  }, []);

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
};