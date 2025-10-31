import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { autonomousAgentService, AgentConfig } from '@/services/autonomousAgentService';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Shield, TrendingUp, AlertTriangle, Settings } from 'lucide-react';

export const AgentControlPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AgentConfig>({
    isEnabled: false,
    maxDailyTrades: 5,
    maxPositionSize: 1000,
    maxDailyLoss: 500,
    riskLevel: 'moderate',
    allowedSymbols: [],
    minConfidence: 0.7,
    stopLossPercent: 5,
    takeProfitPercent: 10
  });
  const [loading, setLoading] = useState(false);
  const [dailyStats, setDailyStats] = useState({ tradeCount: 0, totalLoss: 0, totalProfit: 0 });

  useEffect(() => {
    loadConfig();
    loadDailyStats();
  }, []);

  const loadConfig = async () => {
    try {
      const agentConfig = await autonomousAgentService.getAgentConfig();
      setConfig(agentConfig);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load agent config", variant: "destructive" });
    }
  };

  const loadDailyStats = async () => {
    try {
      const stats = await autonomousAgentService.getDailyStats();
      setDailyStats(stats);
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await autonomousAgentService.updateAgentConfig(config);
      toast({ title: "Success", description: "Agent configuration saved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAgent = async (enabled: boolean) => {
    const newConfig = { ...config, isEnabled: enabled };
    setConfig(newConfig);
    
    try {
      await autonomousAgentService.updateAgentConfig(newConfig);
      toast({ 
        title: enabled ? "Agent Activated" : "Agent Deactivated", 
        description: enabled ? "AI agent is now monitoring markets" : "AI agent has been stopped"
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to toggle agent", variant: "destructive" });
      setConfig(config);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'conservative': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'aggressive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Trading Agent
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant={config.isEnabled ? 'default' : 'secondary'}>
                {config.isEnabled ? 'Active' : 'Inactive'}
              </Badge>
              <Switch
                checked={config.isEnabled}
                onCheckedChange={handleToggleAgent}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Today's Trades</span>
              </div>
              <div className="text-2xl font-bold">{dailyStats.tradeCount}</div>
              <div className="text-xs text-muted-foreground">
                Max: {config.maxDailyTrades}
              </div>
            </div>
            
            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Daily Loss</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                ${dailyStats.totalLoss.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Limit: ${config.maxDailyLoss}
              </div>
            </div>
            
            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Risk Level</span>
              </div>
              <Badge className={getRiskLevelColor(config.riskLevel)}>
                {config.riskLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Risk Level</Label>
                <Select 
                  value={config.riskLevel} 
                  onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                    setConfig(prev => ({ ...prev, riskLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Daily Trades</Label>
                <Input
                  type="number"
                  value={config.maxDailyTrades}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxDailyTrades: parseInt(e.target.value) || 0 
                  }))}
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <Label>Max Position Size ($)</Label>
                <Input
                  type="number"
                  value={config.maxPositionSize}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxPositionSize: parseFloat(e.target.value) || 0 
                  }))}
                  min="100"
                  step="100"
                />
              </div>

              <div>
                <Label>Max Daily Loss ($)</Label>
                <Input
                  type="number"
                  value={config.maxDailyLoss}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxDailyLoss: parseFloat(e.target.value) || 0 
                  }))}
                  min="50"
                  step="50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Minimum Confidence ({(config.minConfidence * 100).toFixed(0)}%)</Label>
                <Slider
                  value={[config.minConfidence]}
                  onValueChange={([value]) => setConfig(prev => ({ 
                    ...prev, 
                    minConfidence: value 
                  }))}
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Stop Loss ({config.stopLossPercent}%)</Label>
                <Slider
                  value={[config.stopLossPercent]}
                  onValueChange={([value]) => setConfig(prev => ({ 
                    ...prev, 
                    stopLossPercent: value 
                  }))}
                  min={1}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Take Profit ({config.takeProfitPercent}%)</Label>
                <Slider
                  value={[config.takeProfitPercent]}
                  onValueChange={([value]) => setConfig(prev => ({ 
                    ...prev, 
                    takeProfitPercent: value 
                  }))}
                  min={2}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Allowed Symbols (comma-separated)</Label>
                <Input
                  value={config.allowedSymbols.join(', ')}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    allowedSymbols: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="AAPL, GOOGL, MSFT, TSLA"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveConfig} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={loadConfig}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {config.isEnabled && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-800 mb-1">Supervised Trading Mode</h4>
                <p className="text-yellow-700">
                  The AI agent will generate trading suggestions based on your configuration. 
                  All trades require your approval before execution. The agent learns from your feedback to improve future decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};