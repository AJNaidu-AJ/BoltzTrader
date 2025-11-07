import { useEffect, useState } from 'react';
import { getPerformanceData } from '@/services/performanceService';

export const PerformanceChart = () => {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPerformanceData(range)
      .then((d) => setData(d))
      .catch((error) => {
        console.error('Performance data fetch error:', error);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center">
        <p className="text-gray-400 text-center">Loading performance data...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center">
        <p className="text-gray-400 text-center">No performance data available.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.accuracy));
  const minValue = Math.min(...data.map(d => d.accuracy));
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;
  const chartMin = Math.max(75, minValue - padding);
  const chartMax = Math.min(100, maxValue + padding);
  const chartRange = chartMax - chartMin;

  return (
    <div className="w-full h-[400px] p-4 bg-white border rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-lg">Performance Chart</h3>
          <p className="text-sm text-gray-500">Signal accuracy over time</p>
        </div>
        <div className="flex gap-1">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                range === r 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 800 300">
          <defs>
            <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line 
              key={`grid-${i}`} 
              x1="60" 
              y1={50 + i * 40} 
              x2="740" 
              y2={50 + i * 40} 
              stroke="#f3f4f6" 
              strokeWidth="1" 
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const value = chartMax - (i * chartRange / 5);
            return (
              <text 
                key={`y-label-${i}`} 
                x="50" 
                y={55 + i * 40} 
                textAnchor="end" 
                className="text-xs fill-gray-500"
              >
                {value.toFixed(1)}%
              </text>
            );
          })}
          
          {/* Chart area */}
          <path
            d={`M 60 250 L 60 ${250 - ((data[0].accuracy - chartMin) / chartRange) * 200} ${data.map((point, i) => {
              const x = 60 + (i * (680 / (data.length - 1)));
              const y = 250 - ((point.accuracy - chartMin) / chartRange) * 200;
              return `L ${x} ${y}`;
            }).join(' ')} L 740 250 Z`}
            fill="url(#performanceGradient)"
          />
          
          {/* Chart line */}
          <path
            d={`M 60 ${250 - ((data[0].accuracy - chartMin) / chartRange) * 200} ${data.map((point, i) => {
              const x = 60 + (i * (680 / (data.length - 1)));
              const y = 250 - ((point.accuracy - chartMin) / chartRange) * 200;
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((point, i) => {
            const x = 60 + (i * (680 / (data.length - 1)));
            const y = 250 - ((point.accuracy - chartMin) / chartRange) * 200;
            return (
              <circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="#3B82F6"
                className="hover:r-4 cursor-pointer"
              />
            );
          })}
          
          {/* X-axis labels */}
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((point, i) => {
            const originalIndex = i * Math.ceil(data.length / 6);
            const x = 60 + (originalIndex * (680 / (data.length - 1)));
            return (
              <text 
                key={`x-label-${i}`} 
                x={x} 
                y="275" 
                textAnchor="middle" 
                className="text-xs fill-gray-500"
              >
                {point.date}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Performance metrics */}
      <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            +{((data[data.length - 1].return - data[0].return)).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 font-medium">Total Return</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, d) => sum + d.signals, 0)}
          </div>
          <div className="text-sm text-gray-600 font-medium">Total Signals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 font-medium">Avg Accuracy</div>
        </div>
      </div>
    </div>
  );
};