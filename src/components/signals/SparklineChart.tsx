import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
  className?: string;
}

export function SparklineChart({ data, color = "hsl(var(--success))", className }: SparklineChartProps) {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({ value, index }));
  }, [data]);

  const strokeColor = data[data.length - 1] >= data[0] 
    ? "hsl(var(--success))" 
    : "hsl(var(--destructive))";

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
