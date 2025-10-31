import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalMarketDashboard } from '@/components/global/GlobalMarketDashboard';
import { BrokerConnections } from '@/components/global/BrokerConnections';
import { LocaleSelector } from '@/components/global/LocaleSelector';

export const GlobalMarkets = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Global Markets</h1>
        <p className="text-muted-foreground">
          Access worldwide markets with multi-region data and broker connections
        </p>
      </div>

      <Tabs defaultValue="markets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="markets">Market Data</TabsTrigger>
          <TabsTrigger value="brokers">Broker Connections</TabsTrigger>
          <TabsTrigger value="settings">Localization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="markets">
          <GlobalMarketDashboard />
        </TabsContent>
        
        <TabsContent value="brokers">
          <BrokerConnections />
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="max-w-2xl">
            <LocaleSelector showCard={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};