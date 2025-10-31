import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { autonomousAgentService, TradeDecision, AgentFeedback } from '@/services/autonomousAgentService';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Brain } from 'lucide-react';

export const AgentDecisions = () => {
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<TradeDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDecisions();
    // Poll for new decisions every 30 seconds
    const interval = setInterval(loadDecisions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDecisions = async () => {
    try {
      // Mock decisions - replace with actual API call
      const mockDecisions: TradeDecision[] = [
        {
          id: 'decision_1',
          symbol: 'AAPL',
          action: 'buy',
          quantity: 50,
          confidence: 0.85,
          reasoning: ['Strong technical momentum', 'Bullish breakout pattern', 'High volume confirmation'],
          riskScore: 0.3,
          expectedReturn: 8.5,
          stopLoss: 145.20,
          takeProfit: 162.80,
          timestamp: new Date().toISOString()
        },
        {
          id: 'decision_2',
          symbol: 'TSLA',
          action: 'sell',
          quantity: 25,
          confidence: 0.72,
          reasoning: ['Bearish divergence detected', 'Resistance level rejection', 'Overbought conditions'],
          riskScore: 0.5,
          expectedReturn: -3.2,
          stopLoss: 245.60,
          takeProfit: 220.40,
          timestamp: new Date(Date.now() - 300000).toISOString()
        }
      ];
      setDecisions(mockDecisions);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load decisions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (decisionId: string, action: 'approved' | 'rejected') => {
    try {
      const feedback: AgentFeedback = {
        decisionId,
        userAction: action,
        userNotes: feedbackNotes[decisionId] || '',
        performanceScore: action === 'approved' ? 1 : -1
      };

      await autonomousAgentService.submitFeedback(feedback);
      
      toast({ 
        title: "Feedback Submitted", 
        description: `Decision ${action}. Agent will learn from this feedback.`
      });

      // Remove decision from list
      setDecisions(prev => prev.filter(d => d.id !== decisionId));
      setFeedbackNotes(prev => {
        const { [decisionId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
    }
  };

  const getActionIcon = (action: string) => {
    return action === 'buy' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 0.3) return 'bg-green-100 text-green-800';
    if (risk <= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Trading Decisions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and approve AI-generated trading decisions. Your feedback helps improve the agent.
          </p>
        </CardHeader>
      </Card>

      {decisions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending decisions</p>
              <p className="text-sm text-muted-foreground mt-1">
                The AI agent will generate new trading suggestions based on market conditions
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision) => (
            <Card key={decision.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getActionIcon(decision.action)}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {decision.action.toUpperCase()} {decision.symbol}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {decision.quantity} shares
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getConfidenceColor(decision.confidence)}`}>
                      {(decision.confidence * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Expected Return:</span>
                    <div className={`font-medium ${decision.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {decision.expectedReturn >= 0 ? '+' : ''}{decision.expectedReturn.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <div className="font-medium">${decision.stopLoss?.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Take Profit:</span>
                    <div className="font-medium">${decision.takeProfit?.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Score:</span>
                    <Badge className={getRiskColor(decision.riskScore)}>
                      {(decision.riskScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">AI Reasoning:</Label>
                  <ul className="mt-2 space-y-1">
                    {decision.reasoning.map((reason, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label>Your Notes (Optional)</Label>
                  <Textarea
                    value={feedbackNotes[decision.id] || ''}
                    onChange={(e) => setFeedbackNotes(prev => ({
                      ...prev,
                      [decision.id]: e.target.value
                    }))}
                    placeholder="Add notes about why you approved/rejected this decision..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleFeedback(decision.id, 'approved')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Execute
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback(decision.id, 'rejected')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Generated: {new Date(decision.timestamp).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};