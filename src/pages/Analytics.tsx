import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import HeatmapVisualization from '@/components/HeatmapVisualization';
import AutomationMetrics from '@/components/AutomationMetrics';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Analytics Dashboard - Co-Evolve Network" 
        description="Real-time analytics and user behavior insights for Co-Evolve Network platform."
      />
      
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b">
          <div className="container mx-auto px-4">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="automation" className="mt-0">
          <AutomationMetrics />
        </TabsContent>

        <TabsContent value="heatmap" className="mt-0">
          <div className="container mx-auto p-6">
            <HeatmapVisualization />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;