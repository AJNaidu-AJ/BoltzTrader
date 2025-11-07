// Detect user region using free IP geolocation or browser locale fallback
export async function detectRegion(): Promise<'IN' | 'US' | 'GLOBAL'> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const country = data?.country_code || navigator.language.split('-')[1] || 'GLOBAL';
    if (country === 'IN') return 'IN';
    if (country === 'US') return 'US';
    return 'GLOBAL';
  } catch {
    return 'GLOBAL';
  }
}