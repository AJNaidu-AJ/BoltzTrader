import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Play, Save, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { strategyService, StrategyCondition, Strategy } from '@/services/strategyService';

interface ConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: StrategyCondition[];
}

interface StrategyBuilderProps {
  initialStrategy?: Strategy | null;
}

export const StrategyBuilder = ({ initialStrategy }: StrategyBuilderProps) => {
  const { toast } = useToast();
  const [strategy, setStrategy] = useState<Partial<Strategy>>(
    initialStrategy || {
      name: '',
      description: '',
      conditions: []
    }
  );
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>(
    initialStrategy?.conditions?.length ? [
      { id: '1', operator: 'AND', conditions: initialStrategy.conditions }
    ] : [
      { id: '1', operator: 'AND', conditions: [] }
    ]
  );
  const [loading, setLoading] = useState(false);

  const indicators = [
    { value: 'sma', label: 'Simple Moving Average' },
    { value: 'ema', label: 'Exponential Moving Average' },
    { value: 'rsi', label: 'RSI' },
    { value: 'macd', label: 'MACD' },
    { value: 'bb', label: 'Bollinger Bands' },
    { value: 'volume', label: 'Volume' },
    { value: 'price', label: 'Price' }
  ];

  const operators = [
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '>=', label: 'Greater or equal' },
    { value: '<=', label: 'Less or equal' },
    { value: '==', label: 'Equal to' },
    { value: 'cross_above', label: 'Crosses above' },
    { value: 'cross_below', label: 'Crosses below' }
  ];

  const addCondition = (groupId: string) => {
    const newCondition: StrategyCondition = {
      id: Date.now().toString(),
      indicator: '',
      operator: '>',
      value: 0,
      timeframe: '1d'
    };

    setConditionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, conditions: [...group.conditions, newCondition] }
        : group
    ));
  };

  const updateCondition = (groupId: string, conditionId: string, field: string, value: any) => {
    setConditionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: group.conditions.map(condition =>
              condition.id === conditionId ? { ...condition, [field]: value } : condition
            )
          }
        : group
    ));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setConditionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
        : group
    ));
  };

  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      id: Date.now().toString(),
      operator: 'OR',
      conditions: []
    };
    setConditionGroups(prev => [...prev, newGroup]);
  };

  const removeConditionGroup = (groupId: string) => {
    if (conditionGroups.length > 1) {
      setConditionGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const generateStrategyJSON = () => {
    const allConditions = conditionGroups.flatMap(group => 
      group.conditions.map(condition => ({
        ...condition,
        groupOperator: group.operator
      }))
    );

    return {
      ...strategy,
      conditions: allConditions,
      logic: {
        groups: conditionGroups.map(group => ({
          operator: group.operator,
          conditions: group.conditions.map(c => c.id)
        }))
      }
    };
  };

  const saveStrategy = async () => {
    if (!strategy.name) {
      toast({ title: "Error", description: "Strategy name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const strategyData = generateStrategyJSON();
      await strategyService.saveStrategy(strategyData as Strategy);
      toast({ title: "Success", description: "Strategy saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save strategy", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const backtestStrategy = async () => {
    setLoading(true);
    try {
      const strategyData = generateStrategyJSON();
      const result = await strategyService.backtestStrategy(strategyData as Strategy);
      toast({ 
        title: "Backtest Complete", 
        description: `Return: ${result.total_return}%, Sharpe: ${result.sharpe_ratio}` 
      });
    } catch (error) {
      toast({ title: "Error", description: "Backtest failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportStrategy = () => {
    const strategyData = generateStrategyJSON();
    const blob = new Blob([JSON.stringify(strategyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${strategy.name || 'strategy'}.json`;
    a.click();
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Strategy Name</Label>
              <Input
                value={strategy.name || ''}
                onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Trading Strategy"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={strategy.description || ''}
                onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Strategy description"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {conditionGroups.map((group, groupIndex) => (
        <Card key={group.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Group {groupIndex + 1}</Badge>
                <Select
                  value={group.operator}
                  onValueChange={(value: 'AND' | 'OR') => 
                    setConditionGroups(prev => prev.map(g => 
                      g.id === group.id ? { ...g, operator: value } : g
                    ))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {conditionGroups.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeConditionGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.isArray(group.conditions) && group.conditions.map((condition, index) => (
              <div key={condition?.id || `condition-${group.id}-${index}`} className="flex items-center gap-2 p-3 border rounded">
                <Select
                  value={condition?.indicator || ''}
                  onValueChange={(value) => updateCondition(group.id, condition?.id || '', 'indicator', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicators.map(indicator => (
                      <SelectItem key={indicator.value} value={indicator.value}>
                        {indicator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={condition?.operator || '>'}
                  onValueChange={(value) => updateCondition(group.id, condition?.id || '', 'operator', value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={typeof condition?.value === 'number' ? condition.value : 0}
                  onChange={(e) => updateCondition(group.id, condition?.id || '', 'value', parseFloat(e.target.value) || 0)}
                  className="w-24"
                  placeholder="Value"
                />

                <Select
                  value={condition?.timeframe || '1d'}
                  onValueChange={(value) => updateCondition(group.id, condition?.id || '', 'timeframe', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1m</SelectItem>
                    <SelectItem value="5m">5m</SelectItem>
                    <SelectItem value="15m">15m</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="1d">1d</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(group.id, condition?.id || '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => addCondition(group.id)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" onClick={addConditionGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
        <Button onClick={backtestStrategy} disabled={loading}>
          <Play className="h-4 w-4 mr-2" />
          Backtest
        </Button>
        <Button onClick={saveStrategy} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save Strategy
        </Button>
        <Button variant="outline" onClick={exportStrategy}>
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </div>
    </div>
  );
};