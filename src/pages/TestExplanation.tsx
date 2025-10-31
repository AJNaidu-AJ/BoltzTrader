import { useSignals } from '@/hooks/useSignals';
import { SignalExplain } from '@/components/signals/SignalExplain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TestExplanation = () => {
  const { data: signals } = useSignals({ limit: 3 });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test Signal Explanations</h1>
      
      {signals?.data?.map((signal) => (
        <Card key={signal.id}>
          <CardHeader>
            <CardTitle>{signal.symbol} - {signal.company_name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              ${signal.current_price} • {signal.confidence}% confidence • {signal.rank?.toUpperCase()}
            </div>
          </CardHeader>
          <CardContent>
            <SignalExplain signal={signal} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};