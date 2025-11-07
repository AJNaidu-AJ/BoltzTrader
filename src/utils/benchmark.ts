// Region-aware benchmark selection utility
export function getBenchmarkSymbol(region: 'IN' | 'US' | 'GLOBAL'): string {
  switch (region) {
    case 'IN': return 'NIFTY50';
    case 'US': return 'SP500';
    default: return 'BTC';
  }
}

// Compute cumulative from daily returns
export function computeCum(dailyReturns: number[]): number[] {
  const cum: number[] = [];
  let running = 1.0;
  for (let r of dailyReturns) {
    if (!isFinite(r)) r = 0;
    running = running * (1 + r);
    cum.push(running);
  }
  return cum;
}