import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignalExplanation } from '@/hooks/useAI';
import { Brain, Loader2 } from 'lucide-react';

interface SignalExplanationProps {
  signal: any;
}

export const SignalExplanation = ({ signal }: SignalExplanationProps) => {
  const [explanation, setExplanation] = useState<string>('');
  const explainMutation = useSignalExplanation();

  const handleExplain = async () => {
    try {
      const result = await explainMutation.mutateAsync(signal);
      setExplanation(result);
    } catch (error) {
      setExplanation('Unable to generate explanation at this time.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Signal Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!explanation ? (
          <Button 
            onClick={handleExplain} 
            disabled={explainMutation.isPending}
            className="w-full"
          >
            {explainMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Get AI Explanation'
            )}
          </Button>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p>{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};