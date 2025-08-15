import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Globe, Users, Clock, MousePointer, Smartphone, Monitor, Tablet } from 'lucide-react';

interface AnalyticsData {
  id: string;
  session_id: string;
  timestamp: string;
  user_agent: string | null;
  viewport: any;
  location: any;
  interactions: any;
  cultural_data: any;
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time updates
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics'
        },
        () => fetchAnalyticsData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setAnalyticsData(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for visualizations
  const deviceTypeData = analyticsData.reduce((acc, item) => {
    const deviceType = (item.cultural_data as any)?.deviceType || 'unknown';
    acc[deviceType] = (acc[deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceChartData = Object.entries(deviceTypeData).map(([device, count]) => ({
    device,
    count,
    percentage: Math.round((count / analyticsData.length) * 100)
  }));

  const countryData = analyticsData.reduce((acc, item) => {
    const country = (item.location as any)?.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([country, visits]) => ({ country, visits }));

  const languageData = analyticsData.reduce((acc, item) => {
    const language = (item.cultural_data as any)?.language?.split('-')[0] || 'unknown';
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageTimeOnPage = analyticsData.length > 0 
    ? Math.round(analyticsData.reduce((acc, item) => acc + ((item.interactions as any)?.timeOnPage || 0), 0) / analyticsData.length / 1000)
    : 0;

  const averageScrollDepth = analyticsData.length > 0
    ? Math.round(analyticsData.reduce((acc, item) => acc + ((item.interactions as any)?.scrollDepth || 0), 0) / analyticsData.length)
    : 0;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Badge variant="secondary">{analyticsData.length} total sessions</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique visitors tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTimeOnPage}s</div>
            <p className="text-xs text-muted-foreground">
              Average session duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Scroll Depth</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScrollDepth}%</div>
            <p className="text-xs text-muted-foreground">
              How far users scroll
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(countryData).length}</div>
            <p className="text-xs text-muted-foreground">
              Different countries
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>Breakdown by device category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {deviceChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Detailed device statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceChartData.map((item, index) => (
                  <div key={item.device} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
                      {item.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                      {item.device === 'desktop' && <Monitor className="h-4 w-4" />}
                      {item.device === 'tablet' && <Tablet className="h-4 w-4" />}
                      <span className="text-sm font-medium capitalize">{item.device}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={item.percentage} className="w-16" />
                      <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>Visitor distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCountries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Scroll Depth Distribution</CardTitle>
                <CardDescription>How deep users scroll on your page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>0-25%</span>
                    <span>{analyticsData.filter(d => ((d.interactions as any)?.scrollDepth || 0) <= 25).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>26-50%</span>
                    <span>{analyticsData.filter(d => ((d.interactions as any)?.scrollDepth || 0) > 25 && ((d.interactions as any)?.scrollDepth || 0) <= 50).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>51-75%</span>
                    <span>{analyticsData.filter(d => ((d.interactions as any)?.scrollDepth || 0) > 50 && ((d.interactions as any)?.scrollDepth || 0) <= 75).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>76-100%</span>
                    <span>{analyticsData.filter(d => ((d.interactions as any)?.scrollDepth || 0) > 75).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>User languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(languageData)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([lang, count]) => (
                      <div key={lang} className="flex justify-between items-center">
                        <span className="text-sm font-medium uppercase">{lang}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest visitor sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {(session.location as any)?.city && (session.location as any)?.country 
                          ? `${(session.location as any).city}, ${(session.location as any).country}`
                          : (session.location as any)?.country || 'Unknown Location'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.timestamp).toLocaleDateString()} • 
                        {(session.cultural_data as any)?.deviceType} • 
                        {Math.round(((session.interactions as any)?.timeOnPage || 0) / 1000)}s
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={(session.interactions as any)?.scrollDepth > 50 ? 'default' : 'secondary'}>
                        {(session.interactions as any)?.scrollDepth || 0}% scrolled
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;