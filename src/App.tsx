import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MobileOptimized } from "./components/mobile/MobileOptimized";
import { FeedbackWidget } from "./components/feedback/FeedbackWidget";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Sectors = lazy(() => import("./pages/Sectors"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Billing = lazy(() => import("./pages/Billing"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PWAInstall = lazy(() => import("./pages/PWAInstall"));
const TradingHistory = lazy(() => import("./pages/TradingHistory"));
const StrategyBuilder = lazy(() => import("./pages/StrategyBuilder"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const GlobalMarkets = lazy(() => import("./pages/GlobalMarkets"));
const AutonomousAgent = lazy(() => import("./pages/AutonomousAgent"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const CognitiveEngine = lazy(() => import("./pages/CognitiveEngine"));
const StrategyLibrary = lazy(() => import("./pages/StrategyLibrary"));
const RiskManagement = lazy(() => import("./pages/RiskManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

const AppContent = () => {
  useKeyboardShortcuts();
  return (
    <MobileOptimized>
      <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/install" element={<PWAInstall />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><AppLayout><Analysis /></AppLayout></ProtectedRoute>} />
      <Route path="/sectors" element={<ProtectedRoute><AppLayout><Sectors /></AppLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><AppLayout><Watchlist /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><AppLayout><Billing /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/trading" element={<ProtectedRoute><AppLayout><TradingHistory /></AppLayout></ProtectedRoute>} />
      <Route path="/strategy-builder" element={<ProtectedRoute><AppLayout><StrategyBuilder /></AppLayout></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
      <Route path="/global-markets" element={<ProtectedRoute><AppLayout><GlobalMarkets /></AppLayout></ProtectedRoute>} />
      <Route path="/ai-agent" element={<ProtectedRoute><AppLayout><AutonomousAgent /></AppLayout></ProtectedRoute>} />
      <Route path="/cognitive" element={<ProtectedRoute><AppLayout><CognitiveEngine /></AppLayout></ProtectedRoute>} />
      <Route path="/strategy-library" element={<ProtectedRoute><AppLayout><StrategyLibrary /></AppLayout></ProtectedRoute>} />
      <Route path="/risk-management" element={<ProtectedRoute><AppLayout><RiskManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/enterprise" element={<ProtectedRoute><AppLayout><Enterprise /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </MobileOptimized>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <AppContent />
            <PWAInstallPrompt />
            <FeedbackWidget />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
