import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface PriceChartProps {
  data: Array<{
    timestamp: string;
    price: number;
    volume?: number;
  }>;
  type?: "line" | "area";
  color?: string;
  className?: string;
}

export function PriceChart({
  data,
  type = "area",
  color = "hsl(var(--primary))",
  className,
}: PriceChartProps) {
  const ChartComponent = type === "area" ? AreaChart : LineChart;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="timestamp"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
          />
          {type === "area" ? (
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              fillOpacity={1}
              fill="url(#priceGradient)"
              strokeWidth={2}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
