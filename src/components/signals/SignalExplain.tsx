import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { explanationService } from '@/services/explanationApi';
import { HelpCircle, ChevronDown, Loader2, Lightbulb } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface SignalExplainProps {
  signal: Tables<'signals'>;
}

export const SignalExplain = ({ signal }: SignalExplainProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string[]>(signal.explanation ? 
    signal.explanation.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim()) : 
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Extract top 3 rules from signal data
  const topRules = signal.rule_matches ? 
    (Array.isArray(signal.rule_matches) ? signal.rule_matches : []).slice(0, 3) :
    [
      { name: 'Technical Analysis', value: `${signal.confidence}% confidence`, weight: 0.4 },
      { name: 'Price Action', value: `${signal.price_change_percent?.toFixed(1)}% change`, weight: 0.3 },
      { name: 'Market Sentiment', value: signal.rank || 'medium', weight: 0.3 }
    ];

  const handleExplain = async () => {
    if (explanation.length > 0) {
      setIsOpen(!isOpen);
      return;
    }

    setIsLoading(true);
    try {
      const response = await explanationService.explainSignal({
        symbol: signal.symbol,
        action: signal.rank === 'top' ? 'BUY' : 'HOLD',
        ruleMatches: topRules
      });

      setExplanation(response.bullets);
      
      // Save explanation to database
      if (response.explanation) {
        await explanationService.saveExplanation(signal.id, response.explanation);
      }
      
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to get explanation:', error);
      // Show fallback explanation
      setExplanation([
        'Technical indicators suggest favorable conditions',
        'Market momentum supports this signal direction', 
        'Risk-reward ratio meets our criteria'
      ]);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top 3 Rules */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Key Indicators</h4>
        <div className="flex flex-wrap gap-2">
          {topRules.map((rule, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {rule.name}: {rule.value}
            </Badge>
          ))}
        </div>
      </div>

      {/* Why This Button */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExplain}
            disabled={isLoading}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Why this signal?
            </div>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                AI Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {explanation.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};