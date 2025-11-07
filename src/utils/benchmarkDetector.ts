export function detectBenchmarkByRegion(region: string): string {
  switch (region.toUpperCase()) {
    case 'IN':
      return 'NIFTY50';
    case 'US':
      return 'S&P500';
    default:
      return 'BTC';
  }
}

export function shouldShowBenchmark(region: string): boolean {
  return region !== 'IN' && region !== 'US'; // Only show globally
}

export function calculateAlpha(aiReturn: number, benchmarkReturn: number): string {
  return ((aiReturn - benchmarkReturn) * 100).toFixed(2);
}