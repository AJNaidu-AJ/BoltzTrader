import { Signal } from "@/components/tables/SignalTable";

// Generate random sparkline data
const generateSparkline = () => {
  const length = 20;
  const data = [];
  let current = Math.random() * 100 + 50;
  
  for (let i = 0; i < length; i++) {
    current += (Math.random() - 0.5) * 10;
    data.push(Math.max(0, current));
  }
  
  return data;
};

export const mockSignals: Signal[] = [
  {
    id: "1",
    rank: "top",
    symbol: "AAPL",
    company: "Apple Inc.",
    sector: "technology",
    confidence: 0.89,
    price: 178.45,
    priceChange: 2.4,
    volume: 52340000,
    volumeChange: 15.3,
    sentiment: "positive",
    sentimentScore: 0.82,
    sparklineData: generateSparkline(),
  },
  {
    id: "2",
    rank: "top",
    symbol: "MSFT",
    company: "Microsoft Corporation",
    sector: "technology",
    confidence: 0.85,
    price: 378.92,
    priceChange: 1.8,
    volume: 24560000,
    volumeChange: 8.7,
    sentiment: "positive",
    sentimentScore: 0.76,
    sparklineData: generateSparkline(),
  },
  {
    id: "3",
    rank: "top",
    symbol: "GOOGL",
    company: "Alphabet Inc.",
    sector: "technology",
    confidence: 0.82,
    price: 142.68,
    priceChange: 1.5,
    volume: 18920000,
    volumeChange: 12.1,
    sentiment: "positive",
    sentimentScore: 0.71,
    sparklineData: generateSparkline(),
  },
  {
    id: "4",
    rank: "medium",
    symbol: "JPM",
    company: "JPMorgan Chase & Co.",
    sector: "finance",
    confidence: 0.74,
    price: 198.34,
    priceChange: 0.9,
    volume: 12450000,
    volumeChange: 5.4,
    sentiment: "neutral",
    sentimentScore: 0.55,
    sparklineData: generateSparkline(),
  },
  {
    id: "5",
    rank: "medium",
    symbol: "JNJ",
    company: "Johnson & Johnson",
    sector: "healthcare",
    confidence: 0.71,
    price: 162.15,
    priceChange: 0.6,
    volume: 8730000,
    volumeChange: 3.2,
    sentiment: "neutral",
    sentimentScore: 0.52,
    sparklineData: generateSparkline(),
  },
  {
    id: "6",
    rank: "medium",
    symbol: "XOM",
    company: "Exxon Mobil Corporation",
    sector: "energy",
    confidence: 0.68,
    price: 108.76,
    priceChange: -0.3,
    volume: 15620000,
    volumeChange: -2.1,
    sentiment: "neutral",
    sentimentScore: 0.48,
    sparklineData: generateSparkline(),
  },
  {
    id: "7",
    rank: "low",
    symbol: "WMT",
    company: "Walmart Inc.",
    sector: "consumer",
    confidence: 0.58,
    price: 168.92,
    priceChange: -0.8,
    volume: 9340000,
    volumeChange: -4.5,
    sentiment: "negative",
    sentimentScore: 0.38,
    sparklineData: generateSparkline(),
  },
  {
    id: "8",
    rank: "low",
    symbol: "DIS",
    company: "The Walt Disney Company",
    sector: "consumer",
    confidence: 0.55,
    price: 96.47,
    priceChange: -1.2,
    volume: 11250000,
    volumeChange: -6.8,
    sentiment: "negative",
    sentimentScore: 0.35,
    sparklineData: generateSparkline(),
  },
  {
    id: "9",
    rank: "top",
    symbol: "NVDA",
    company: "NVIDIA Corporation",
    sector: "technology",
    confidence: 0.91,
    price: 489.33,
    priceChange: 3.7,
    volume: 41230000,
    volumeChange: 22.4,
    sentiment: "positive",
    sentimentScore: 0.88,
    sparklineData: generateSparkline(),
  },
  {
    id: "10",
    rank: "medium",
    symbol: "BAC",
    company: "Bank of America Corporation",
    sector: "finance",
    confidence: 0.69,
    price: 36.84,
    priceChange: 0.4,
    volume: 38940000,
    volumeChange: 1.9,
    sentiment: "neutral",
    sentimentScore: 0.54,
    sparklineData: generateSparkline(),
  },
];

// Generate mock price chart data
export const generatePriceChartData = (days: number = 30) => {
  const data = [];
  let price = 150;
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    price += (Math.random() - 0.5) * 10;
    price = Math.max(100, Math.min(200, price));
    
    data.push({
      timestamp: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }
  
  return data;
};
