import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMetrics } from '@/hooks/usePerformance';
import { TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';

export const PerformanceMetrics = ({ userId }: { userId: string }) => {
  const { data: metrics, isLoading } = usePerformanceMetrics(userId);

  if (isLoading) return <div>Loading performance metrics...</div>;
  if (!metrics) return null;

  const metricCards = [
    {
      title: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      color: metrics.winRate >= 60 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Total Return',
      value: `${metrics.totalReturn > 0 ? '+' : ''}${metrics.totalReturn.toFixed(2)}%`,
      icon: TrendingUp,
      color: metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Best Trade',
      value: `+${metrics.bestTrade.toFixed(2)}%`,
      icon: Award,
      color: 'text-green-600'
    },
    {
      title: 'Worst Trade',
      value: `${metrics.worstTrade.toFixed(2)}%`,
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {metrics.totalSignals} signals
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};