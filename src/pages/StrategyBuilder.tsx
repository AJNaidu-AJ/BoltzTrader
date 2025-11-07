import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategyBuilder as StrategyBuilderComponent } from '@/components/strategy/StrategyBuilder';
import { StrategyTemplates } from '@/components/strategy/StrategyTemplates';
import { Strategy } from '@/services/strategyService';

const StrategyBuilder = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeTab, setActiveTab] = useState('builder');

  // Defensive check to prevent null tab errors
  if (!activeTab) setActiveTab('builder');

  const handleSelectTemplate = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setActiveTab('builder');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Strategy Builder</h1>
        <p className="text-muted-foreground">
          Create and backtest your trading strategies with our visual builder
        </p>
      </div>

      <Tabs value={activeTab || 'builder'} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder" className="mt-6">
          <StrategyBuilderComponent initialStrategy={selectedStrategy} />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <StrategyTemplates onSelectTemplate={handleSelectTemplate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyBuilder;