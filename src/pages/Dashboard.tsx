import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DashboardOverview, 
  DashboardStrategies, 
  DashboardRisk, 
  DashboardOrders, 
  DashboardMonitor, 
  DashboardLangGraph, 
  DashboardLearning 
} from '@/components/dashboard/DashboardPanels';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Defensive check to prevent null tab errors
  if (!activeTab) setActiveTab('overview');

  // Ensure all imports are loaded before rendering
  if (!DashboardOverview || !DashboardStrategies || !DashboardRisk) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">BoltzTrader Dashboard</h1>
      </div>

      <Tabs value={activeTab || 'overview'} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="langgraph">LangGraph</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ErrorBoundary>
            <DashboardOverview />
          </ErrorBoundary>
          <div className="grid gap-6 md:grid-cols-2">
            <ErrorBoundary>
              <DashboardStrategies />
            </ErrorBoundary>
            <ErrorBoundary>
              <DashboardRisk />
            </ErrorBoundary>
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <ErrorBoundary>
              <DashboardMonitor />
            </ErrorBoundary>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <ErrorBoundary>
            <DashboardOrders />
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="langgraph">
          <ErrorBoundary>
            <DashboardLangGraph />
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="learning">
          <ErrorBoundary>
            <DashboardLearning />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
