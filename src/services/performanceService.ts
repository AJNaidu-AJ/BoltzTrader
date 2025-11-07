import { detectRegion } from '@/utils/geoRegion';
import { getBenchmarkSymbol, computeCum } from '@/utils/benchmark';

type PerformancePoint = {
  date: string;
  user_cum: number;
  benchmark_cum?: number;
};

export async function getPerformanceData(range: '7D' | '30D' | '90D'): Promise<PerformancePoint[]> {
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90;
  
  // Generate mock daily returns
  const dailyReturns = Array.from({ length: days }, () => {
    return (Math.random() - 0.5) * 0.04; // -2% to +2% daily
  });
  
  // Compute cumulative multipliers
  const userCum = computeCum(dailyReturns);
  
  // Generate benchmark data
  const region = await detectRegion();
  const symbol = getBenchmarkSymbol(region);
  const benchmarkReturns = Array.from({ length: days }, () => {
    const baseReturn = symbol === 'BTC' ? 0.01 : symbol === 'SP500' ? 0.008 : 0.006;
    return baseReturn + (Math.random() - 0.5) * 0.02;
  });
  const benchmarkCum = computeCum(benchmarkReturns);
  
  // Create aligned time series
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      user_cum: userCum[i],
      benchmark_cum: benchmarkCum[i]
    };
  });
}

export async function getBenchmarkData(range: '7D' | '30D' | '90D') {
  const region = await detectRegion();
  const symbol = getBenchmarkSymbol(region);
  return { symbol, data: [] };
}