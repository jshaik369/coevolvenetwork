import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import AutomationDashboard from "./pages/AutomationDashboard";
import Assistant from "./pages/Assistant";
import OperatorGuide from "./pages/OperatorGuide";
import BackupsDashboard from "./pages/BackupsDashboard";
import CardView from "./pages/CardView";
import CreateCard from "./pages/CreateCard";
import EditCard from "./pages/EditCard";
import MyCards from "./pages/MyCards";
import CardAnalytics from "./pages/CardAnalytics";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={routerBasename}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/analytics" element={
              <AdminRoute>
                <Analytics />
              </AdminRoute>
            } />
            <Route path="/automation" element={
              <AdminRoute>
                <AutomationDashboard />
              </AdminRoute>
            } />
            <Route path="/assistant" element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            } />
            <Route path="/operator-guide" element={<OperatorGuide />} />
            <Route path="/analytics/backups" element={
              <AdminRoute>
                <BackupsDashboard />
              </AdminRoute>
            } />
            <Route path="/card/:uniqueId" element={<CardView />} />
            <Route path="/card/create" element={
              <ProtectedRoute>
                <CreateCard />
              </ProtectedRoute>
            } />
            <Route path="/card/edit/:cardId" element={
              <ProtectedRoute>
                <EditCard />
              </ProtectedRoute>
            } />
            <Route path="/cards" element={
              <ProtectedRoute>
                <MyCards />
              </ProtectedRoute>
            } />
            <Route path="/card/analytics/:cardId" element={
              <ProtectedRoute>
                <CardAnalytics />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
