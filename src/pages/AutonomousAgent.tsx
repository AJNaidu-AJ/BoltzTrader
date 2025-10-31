import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentControlPanel } from '@/components/agent/AgentControlPanel';
import { AgentDecisions } from '@/components/agent/AgentDecisions';
import { AgentPerformance } from '@/components/agent/AgentPerformance';

export const AutonomousAgent = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Autonomous Trading Agent</h1>
        <p className="text-muted-foreground">
          AI-powered trading assistant with supervised learning and risk management
        </p>
      </div>

      <Tabs defaultValue="control" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="control">Agent Control</TabsTrigger>
          <TabsTrigger value="decisions">Pending Decisions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="control">
          <AgentControlPanel />
        </TabsContent>
        
        <TabsContent value="decisions">
          <AgentDecisions />
        </TabsContent>
        
        <TabsContent value="performance">
          <AgentPerformance />
        </TabsContent>
      </Tabs>
    </div>
  );
};