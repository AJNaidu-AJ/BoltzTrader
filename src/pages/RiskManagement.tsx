import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { riskApi, RiskAssessment, PolicyStats } from '@/services/riskApi';
import { Shield, AlertTriangle, Activity, TrendingDown, History, RotateCcw } from 'lucide-react';

const RiskManagement: React.FC = () => {
  const [policies, setPolicies] = useState<any>({});
  const [stats, setStats] = useState<PolicyStats | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPolicies();
    loadStats();
  }, []);

  const loadPolicies = async () => {
    const data = await riskApi.getPolicies();
    setPolicies(data);
  };

  const loadStats = async () => {
    const data = await riskApi.getStats();
    setStats(data);
  };

  const testRiskEngine = async () => {
    setLoading(true);
    try {
      const result = await riskApi.testRiskEvaluation();
      setTestResult(result);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ALLOW': return 'text-green-600 bg-green-50';
      case 'RESIZE': return 'text-yellow-600 bg-yellow-50';
      case 'DELAY': return 'text-blue-600 bg-blue-50';
      case 'BLOCK': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const PolicyVersionDialog = ({ policyId }: { policyId: string }) => {
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadVersions = async () => {
      setLoading(true);
      try {
        const result = await riskApi.getPolicyVersions(policyId);
        setVersions(result.versions || []);
      } catch (error) {
        console.error('Failed to load versions:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleRollback = async (version: number) => {
      try {
        await riskApi.rollbackPolicy(policyId, version, 'admin');
        alert(`Policy rolled back to version ${version}`);
      } catch (error) {
        alert('Failed to rollback policy');
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={loadVersions}>
            <History className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Policy Version History</DialogTitle>
            <DialogDescription>
              View and manage policy versions for rollback capability
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div>Loading versions...</div>
            ) : versions.length === 0 ? (
              <div>No versions found</div>
            ) : (
              versions.map((version) => (
                <Card key={version.version}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Version {version.version}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {new Date(version.changed_at).toLocaleDateString()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(version.version)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Rollback
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(version.definition, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Risk Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Autonomous safety and compliance system with policy versioning
          </p>
        </div>
        <Button onClick={testRiskEngine} disabled={loading}>
          {loading ? 'Testing...' : 'Test Risk Engine'}
        </Button>
      </div>

      {/* Risk Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_policies || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.enabled_policies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_evaluations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Policy Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats ? Object.values(stats.policy_triggers).reduce((a, b) => a + b, 0) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment Test Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Risk Assessment</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(testResult.test_assessment.action)}>
                      {testResult.test_assessment.action}
                    </Badge>
                    <span className={`text-sm font-semibold ${getRiskLevelColor(testResult.test_assessment.risk_level)}`}>
                      {testResult.test_assessment.risk_level} Risk
                    </span>
                  </div>
                  <div className="text-sm">
                    Confidence: {(testResult.test_assessment.confidence * 100).toFixed(1)}%
                  </div>
                  {testResult.test_assessment.adjustments?.quantity && (
                    <div className="text-sm text-blue-600">
                      Quantity adjusted to: {testResult.test_assessment.adjustments.quantity}
                    </div>
                  )}
                  <div className="text-sm space-y-1">
                    {testResult.test_assessment.reasoning.map((reason: string, i: number) => (
                      <div key={i}>• {reason}</div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Policy Triggers</h4>
                <div className="space-y-1">
                  {Object.entries(testResult.firewall_stats.policy_triggers).map(([policy, count]: [string, any]) => (
                    <div key={policy} className="flex items-center justify-between text-sm">
                      <span>{policy.replace('_', ' ').replace('v1', '')}</span>
                      <Badge variant="outline">{count} triggers</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Risk Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {(policies.policies || []).map((policy: any, i: number) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{policy.name}</h4>
                  <div className="flex items-center gap-2">
                    <PolicyVersionDialog policyId={policy.policy_id} />
                    <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                      {policy.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      P{policy.priority}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Triggers:</span>
                    <div className="font-semibold">{policy.trigger_count}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Triggered:</span>
                    <div className="font-semibold text-xs">
                      {policy.last_triggered ? new Date(policy.last_triggered).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Details */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Exposure Control</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div>Max Position: 15%</div>
            <div>Max Exposure: 80%</div>
            <div>Max Sector: 25%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Volatility Gate</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div>Low VIX: &lt; 15</div>
            <div>High VIX: &gt; 25</div>
            <div>Extreme: &gt; 40</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Drawdown Control</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div>Daily Limit: 5%</div>
            <div>Max Drawdown: 15%</div>
            <div>Cooling: 24h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reputation System</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div>Min Score: 0.3</div>
            <div>Low Threshold: 0.5</div>
            <div>High Threshold: 0.8</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskManagement;