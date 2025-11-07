import React, { useMemo, useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { getPerformanceData } from '@/services/performanceService';
import { useRegion } from '@/hooks/useRegion';
import { detectBenchmarkByRegion, shouldShowBenchmark, calculateAlpha } from '@/utils/benchmarkDetector';
import { recordFeedback } from '@/services/ai-feedback/feedbackEngine';
import { syncFeedbackToAI } from '@/services/ai-feedback/trainingAdapter';
import { Brain } from 'lucide-react';

type Point = {
  date: string;
  user_cum: number;
  benchmark_cum?: number;
};

export function PerformanceChart() {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [data, setData] = useState<Point[]>([]);
  const region = useRegion();
  const benchmark = detectBenchmarkByRegion(region);
  const showBenchmark = shouldShowBenchmark(region);
  const [alpha, setAlpha] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const perfData = await getPerformanceData(range);
      setData(perfData);
      
      // Calculate alpha and record feedback
      if (perfData.length > 0) {
        const last = perfData[perfData.length - 1];
        if (last.benchmark_cum) {
          const alphaValue = calculateAlpha(last.user_cum, last.benchmark_cum);
          setAlpha(alphaValue);
          
          // Record AI feedback for learning
          await recordFeedback(
            'STRAT-DEFAULT', 
            last.user_cum, 
            last.benchmark_cum, 
            'user-123', 
            benchmark
          );
          
          // Trigger AI learning sync (demo)
          if (Math.random() < 0.1) { // 10% chance to trigger sync
            await syncFeedbackToAI();
          }
        }
      }
    };
    
    loadData();
  }, [range, benchmark]);

  // Compute domain with padding
  const { yMin, yMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    data.forEach(d => {
      if (isFinite(d.user_cum)) { min = Math.min(min, d.user_cum); max = Math.max(max, d.user_cum); }
      if (showBenchmark && isFinite(d.benchmark_cum)) { min = Math.min(min, d.benchmark_cum); max = Math.max(max, d.benchmark_cum); }
    });
    if (!isFinite(min) || !isFinite(max)) { min = 0.9; max = 1.1; }
    const padding = (max - min) * 0.08 || 0.05;
    return { yMin: min - padding, yMax: max + padding };
  }, [data, showBenchmark]);

  const tooltipFormatter = (value: any, name: string) => {
    const percent = (Number(value) - 1) * 100;
    const label = name === 'user_cum' ? 'AI Performance' : `Benchmark (${benchmark})`;
    return [`${percent.toFixed(2)}%`, label];
  };

  const xTickFormatter = (tick: string) => {
    try { return format(parseISO(tick), 'MMM d'); } catch { return tick; }
  };

  const shouldShowDots = data.length <= 10;

  return (
    <div className="w-full h-[400px] p-4 performance-chart">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          {['7D', '30D', '90D'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 text-sm rounded-md border ${
                range === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {showBenchmark && (
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <input type="checkbox" checked readOnly />
            Show Benchmark ({benchmark})
          </label>
        )}
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="userGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2b8cff" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="#2b8cff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="benchGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickFormatter={xTickFormatter} minTickGap={20} />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v) => `${((v as number) - 1) * 100 | 0}%`}
            width={85}
          />
          <Tooltip 
            formatter={tooltipFormatter} 
            labelFormatter={(l) => {
              try { return format(parseISO(String(l)), 'PPP'); } catch { return String(l); }
            }} 
          />
          <Legend />
          
          {/* Benchmark: secondary area */}
          {showBenchmark && (
            <Area
              type="monotone"
              dataKey="benchmark_cum"
              name={`Benchmark (${benchmark})`}
              stroke="#a855f7"
              fill="url(#benchGrad)"
              strokeWidth={2}
              dot={shouldShowDots}
              activeDot={{ r: 3 }}
              isAnimationActive={true}
            />
          )}
          
          {/* User: main area */}
          <Area
            type="monotone"
            dataKey="user_cum"
            name="AI Performance"
            stroke="#2b8cff"
            fill="url(#userGrad)"
            strokeWidth={2.5}
            dot={shouldShowDots}
            activeDot={{ r: 4 }}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      {alpha !== null && (
        <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
          <div>
            <strong>Alpha:</strong> {alpha.startsWith('-') ? alpha : `+${alpha}`}% vs {benchmark}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Brain className="h-3 w-3 text-blue-500" />
            <span>AI Learning Active</span>
          </div>
        </div>
      )}
    </div>
  );
}