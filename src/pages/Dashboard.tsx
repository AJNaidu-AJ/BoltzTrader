import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DashboardOverview, 
  DashboardStrategies, 
  DashboardRisk, 
  DashboardOrders, 
  DashboardMonitor, 
  DashboardCopilot, 
  DashboardLangGraph, 
  DashboardLearning 
} from '@/components/dashboard/DashboardPanels';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">BoltzTrader Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="copilot">Copilot</TabsTrigger>
          <TabsTrigger value="langgraph">LangGraph</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
          <div className="grid gap-6 md:grid-cols-2">
            <DashboardStrategies />
            <DashboardRisk />
          </div>
        </TabsContent>
        
        <TabsContent value="strategies">
          <DashboardStrategies />
        </TabsContent>
        
        <TabsContent value="risk">
          <DashboardRisk />
        </TabsContent>
        
        <TabsContent value="orders">
          <DashboardOrders />
        </TabsContent>
        
        <TabsContent value="monitor">
          <DashboardMonitor />
        </TabsContent>
        
        <TabsContent value="copilot">
          <DashboardCopilot />
        </TabsContent>
        
        <TabsContent value="langgraph">
          <DashboardLangGraph />
        </TabsContent>
        
        <TabsContent value="learning">
          <DashboardLearning />
        </TabsContent>
      </Tabs>
    </div>
  );
}
