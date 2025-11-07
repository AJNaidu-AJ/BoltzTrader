// Mock data generator for performance service
export async function getPerformanceData(range: '7D' | '30D' | '90D') {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90;
  
  // Generate mock data with realistic performance metrics
  const data = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    const baseAccuracy = 85;
    const trend = i * 0.5; // Slight upward trend
    const noise = (Math.random() - 0.5) * 10; // Random variation
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      signal_accuracy: Math.max(75, Math.min(95, baseAccuracy + trend + noise)),
      total_return: Math.max(-10, Math.min(50, (i * 2) + (Math.random() - 0.3) * 15)),
      total_signals: Math.floor(Math.random() * 50) + 20
    };
  });

  return data.map((item: any) => ({
    date: item.date,
    accuracy: Number(item.signal_accuracy ?? 0),
    return: Number(item.total_return ?? 0),
    signals: Number(item.total_signals ?? 0)
  }));
}