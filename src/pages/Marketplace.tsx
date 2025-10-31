import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategyMarketplace } from '@/components/marketplace/StrategyMarketplace';
import { StrategyPublisher } from '@/components/marketplace/StrategyPublisher';

export const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="explore">Explore Strategies</TabsTrigger>
          <TabsTrigger value="publish">Publish Strategy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="explore" className="mt-6">
          <StrategyMarketplace />
        </TabsContent>
        
        <TabsContent value="publish" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <StrategyPublisher />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};