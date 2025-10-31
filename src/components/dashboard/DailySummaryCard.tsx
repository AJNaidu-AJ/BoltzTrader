import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { aiCoachService, DailySummary, RiskProfile } from '@/services/aiCoachApi';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, TrendingUp, Target, RefreshCw, User } from 'lucide-react';

export const DailySummaryCard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefError || !preferences?.risk_profile_completed) {
        setError('Complete your risk profile to get personalized recommendations');
        return;
      }

      const profile: RiskProfile = {
        risk_tolerance: preferences.risk_tolerance,
        holding_time: preferences.holding_time,
        trade_frequency: preferences.trade_frequency,
        max_position_size: preferences.max_position_size,
        preferred_sectors: preferences.preferred_sectors || []
      };

      setRiskProfile(profile);
      
      const dailySummary = await aiCoachService.generateDailySummary(user.id, profile);
      setSummary(dailySummary);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily summary');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'secondary';
      case 'moderate': return 'default';
      case 'aggressive': return 'destructive';
      default: return 'outline';
    }
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Trading Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/settings'}>
              Complete Risk Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || !riskProfile) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Your Daily Trading Coach
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadUserProfile}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Profile:</span>
          <Badge variant={getRiskBadgeVariant(riskProfile.risk_tolerance)}>
            {riskProfile.risk_tolerance}
          </Badge>
          <span className="text-muted-foreground">•</span>
          <span className="capitalize">{riskProfile.holding_time}-term</span>
          <span className="text-muted-foreground">•</span>
          <span className="capitalize">{riskProfile.trade_frequency} frequency</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">
                {summary.matching_signals_count} signals match your profile
              </div>
              <div className="text-sm text-muted-foreground">
                Out of {summary.total_signals_count} total signals today
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round((summary.matching_signals_count / summary.total_signals_count) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Match Rate</div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 shrink-0">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-blue-900 mb-1">AI Coach Says:</div>
              <p className="text-blue-800 text-sm leading-relaxed">
                {summary.coach_message}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today's Recommendations:</h4>
          <ul className="space-y-1">
            {summary.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t">
          <div className="text-sm">
            <span className="font-medium">Market Outlook: </span>
            <span className="text-muted-foreground">{summary.market_outlook}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};