import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { autonomousAgentService } from '@/services/autonomousAgentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Brain, Award } from 'lucide-react';

export const AgentPerformance = () => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      const data = await autonomousAgentService.getAgentPerformance();
      setPerformance(data);
    } catch (error) {
      console.error('Error loading performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockChartData = [
    { date: '2024-01-01', decisions: 3, approved: 2, performance: 5.2 },
    { date: '2024-01-02', decisions: 5, approved: 4, performance: 8.1 },
    { date: '2024-01-03', decisions: 2, approved: 2, performance: 3.5 },
    { date: '2024-01-04', decisions: 4, approved: 3, performance: -2.1 },
    { date: '2024-01-05', decisions: 6, approved: 5, performance: 12.3 },
    { date: '2024-01-06', decisions: 3, approved: 2, performance: 4.7 },
    { date: '2024-01-07', decisions: 4, approved: 4, performance: 9.8 }
  ];

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

  if (!performance) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No performance data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start using the AI agent to see performance metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Decisions</span>
            </div>
            <div className="text-2xl font-bold">{performance.totalDecisions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Approval Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {(performance.approvalRate * 100).toFixed(1)}%
            </div>
            <Progress value={performance.approvalRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Confidence</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {(performance.avgConfidence * 100).toFixed(1)}%
            </div>
            <Progress value={performance.avgConfidence * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg Performance</span>
            </div>
            <div className={`text-2xl font-bold ${performance.avgPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performance.avgPerformance >= 0 ? '+' : ''}{performance.avgPerformance.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="decisions" fill="#8884d8" name="Total Decisions" />
                <Bar dataKey="approved" fill="#82ca9d" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Performance (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performance.recentDecisions?.slice(0, 5).map((decision: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge variant={decision.action === 'buy' ? 'default' : 'secondary'}>
                    {decision.action.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{decision.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {decision.quantity} • Confidence: {(decision.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      decision.status === 'approved' ? 'default' : 
                      decision.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                  >
                    {decision.status}
                  </Badge>
                  {decision.performance_score !== null && (
                    <div className={`text-sm mt-1 ${decision.performance_score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {decision.performance_score >= 0 ? '+' : ''}{decision.performance_score.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};