// Learning Dashboard Component
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Activity, Zap } from 'lucide-react';
import { learningService } from '@/lib/learning/learningService';

export const LearningDashboard = () => {
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statusData, historyData] = await Promise.all([
        learningService.getStatus(),
        learningService.getLearningHistory(10)
      ]);
      setStatus(statusData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }
  };

  const triggerLearning = async () => {
    setLoading(true);
    try {
      await learningService.runLearningCycle();
      await loadData();
    } catch (error) {
      console.error('Learning cycle failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLearningLoop = () => {
    if (status?.hasActiveLoop) {
      learningService.stopLearningLoop();
    } else {
      learningService.startLearningLoop();
    }
    setTimeout(loadData, 100);
  };

  const renderWeightBar = (label: string, weight: number) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{(weight * 100).toFixed(1)}%</span>
      </div>
      <Progress value={weight * 100} className="h-2" />
    </div>
  );

  if (!status) return <div>Loading learning dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Learning Dashboard
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={triggerLearning}
            disabled={loading || status.isLearning}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? 'Learning...' : 'Trigger Learning'}
          </Button>
          <Button
            onClick={toggleLearningLoop}
            variant={status.hasActiveLoop ? 'destructive' : 'default'}
            size="sm"
          >
            {status.hasActiveLoop ? 'Stop Loop' : 'Start Loop'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Learning Active</span>
              <Badge variant={status.isLearning ? 'default' : 'secondary'}>
                {status.isLearning ? 'Running' : 'Idle'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto Loop</span>
              <Badge variant={status.hasActiveLoop ? 'default' : 'outline'}>
                {status.hasActiveLoop ? 'On' : 'Off'}
              </Badge>
            </div>
            {history.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Last Reward</span>
                <Badge variant={history[0].reward_score > 0 ? 'default' : 'destructive'}>
                  {history[0].reward_score.toFixed(4)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Fusion Weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderWeightBar('Momentum', status.currentWeights.momentum)}
            {renderWeightBar('Breakout', status.currentWeights.breakout)}
            {renderWeightBar('Mean Reversion', status.currentWeights.mean_reversion)}
            {renderWeightBar('Sentiment', status.currentWeights.sentiment)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Learning Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 5).map((snapshot, index) => (
                <div key={snapshot.id} className="flex items-center justify-between text-sm">
                  <span>Iteration {snapshot.learning_iteration}</span>
                  <Badge 
                    variant={snapshot.reward_score > 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {snapshot.reward_score.toFixed(3)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Learning History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((snapshot) => (
              <div key={snapshot.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">#{snapshot.learning_iteration}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(snapshot.snapshot_timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={snapshot.reward_score > 0 ? 'default' : 'destructive'}>
                    Reward: {snapshot.reward_score.toFixed(4)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};