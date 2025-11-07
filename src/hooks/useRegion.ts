import { useEffect, useState } from 'react';

export const useRegion = () => {
  const [region, setRegion] = useState('GLOBAL');

  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setRegion(data.country_code || 'GLOBAL');
      } catch {
        setRegion(navigator.language.includes('en-US') ? 'US' : 'GLOBAL');
      }
    };
    detect();
  }, []);

  return region;
};