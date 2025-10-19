import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { ArrowLeft, Eye, Clock, MousePointer, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  total_views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  total_clicks: number;
  click_breakdown: Record<string, number>;
  recent_views: Array<{
    timestamp: string;
    time_on_page: number;
    device_info: any;
  }>;
}

const CardAnalytics = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total_views: 0,
    unique_visitors: 0,
    avg_time_on_page: 0,
    total_clicks: 0,
    click_breakdown: {},
    recent_views: [],
  });
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [cardId]);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in');
        navigate('/auth');
        return;
      }

      // Verify ownership
      const { data: card, error: cardError } = await supabase
        .from('business_cards')
        .select('name, user_id')
        .eq('id', cardId)
        .single();

      if (cardError || !card || card.user_id !== user.id) {
        toast.error('Card not found');
        navigate('/cards');
        return;
      }

      setCardName(card.name);

      // Fetch analytics
      const { data, error } = await supabase
        .from('business_card_analytics')
        .select('*')
        .eq('card_id', cardId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Process analytics
      const uniqueSessionsSet = new Set(data.map((d) => d.session_id));
      const totalViews = data.length;
      const uniqueVisitors = uniqueSessionsSet.size;
      
      const avgTime = data.reduce((acc, curr) => acc + (curr.time_on_page || 0), 0) / 
        (data.length || 1);

      const clickBreakdown: Record<string, number> = {};
      let totalClicks = 0;

      data.forEach((entry) => {
        const clicks = entry.click_events || [];
        if (Array.isArray(clicks)) {
          clicks.forEach((click: any) => {
            const action = click.action || 'unknown';
            clickBreakdown[action] = (clickBreakdown[action] || 0) + 1;
            totalClicks++;
          });
        }
      });

      setAnalytics({
        total_views: totalViews,
        unique_visitors: uniqueVisitors,
        avg_time_on_page: Math.round(avgTime),
        total_clicks: totalClicks,
        click_breakdown: clickBreakdown,
        recent_views: data.slice(0, 10),
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={`Analytics - ${cardName} - Co-Evolve Network`}
        description="View analytics for your business card"
      />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Button onClick={() => navigate('/cards')} variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Cards
          </Button>

          <h1 className="text-4xl font-bold mb-2">Card Analytics</h1>
          <p className="text-muted-foreground mb-8">{cardName}</p>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{analytics.total_views}</h3>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{analytics.unique_visitors}</h3>
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{analytics.avg_time_on_page}s</h3>
              <p className="text-sm text-muted-foreground">Avg Time on Page</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointer className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{analytics.total_clicks}</h3>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
            </Card>
          </div>

          {/* Click Breakdown */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Click Breakdown</h2>
            {Object.keys(analytics.click_breakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.click_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="capitalize">{action.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.total_clicks) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-semibold w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No clicks recorded yet</p>
            )}
          </Card>

          {/* Recent Views */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Views</h2>
            {analytics.recent_views.length > 0 ? (
              <div className="space-y-3">
                {analytics.recent_views.map((view, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(view.timestamp).toLocaleDateString()} at{' '}
                        {new Date(view.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {view.device_info?.platform || 'Unknown device'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{view.time_on_page}s</p>
                      <p className="text-sm text-muted-foreground">Time on page</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No views recorded yet</p>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default CardAnalytics;
