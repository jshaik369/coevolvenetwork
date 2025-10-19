import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Mail, Sparkles, Database, Clock, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AutomationMetricsSummary {
  jobs: {
    total: number;
    enabled: number;
    running: number;
    completed_today: number;
    failed_today: number;
  };
  gmail: {
    messages_processed_today: number;
    leads_found_today: number;
    avg_lead_score: number;
  };
  ai: {
    insights_generated_today: number;
    commands_processed_today: number;
    avg_processing_time_ms: number;
  };
  backups: {
    last_backup_time: string | null;
    last_backup_status: 'success' | 'failed' | 'none';
    tables_backed_up: number;
    total_size_mb: number;
  };
}

const AutomationMetrics = () => {
  const [metrics, setMetrics] = useState<AutomationMetricsSummary>({
    jobs: { total: 0, enabled: 0, running: 0, completed_today: 0, failed_today: 0 },
    gmail: { messages_processed_today: 0, leads_found_today: 0, avg_lead_score: 0 },
    ai: { insights_generated_today: 0, commands_processed_today: 0, avg_processing_time_ms: 0 },
    backups: { last_backup_time: null, last_backup_status: 'none', tables_backed_up: 0, total_size_mb: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('automation-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'automation_logs' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gmail_metadata' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_insights' }, () => fetchMetrics())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch job metrics
      const { data: jobs } = await supabase.from('automation_jobs').select('*');
      const { data: logsToday } = await supabase
        .from('automation_logs')
        .select('*')
        .gte('created_at', `${today}T00:00:00`);
      
      // Fetch Gmail metrics
      const { data: gmailToday } = await supabase
        .from('gmail_metadata')
        .select('*')
        .gte('created_at', `${today}T00:00:00`);
      
      // Fetch AI metrics
      const { data: aiInsights } = await supabase
        .from('ai_insights')
        .select('*')
        .gte('created_at', `${today}T00:00:00`);
      
      const { data: aiCommands } = await supabase
        .from('ai_command_queue')
        .select('*')
        .gte('created_at', `${today}T00:00:00`);
      
      // Fetch backup metrics
      const { data: backupHistory } = await supabase
        .from('backup_history')
        .select('*')
        .order('backup_timestamp', { ascending: false })
        .limit(1);
      
      const { data: latestBackupLogs } = await supabase
        .from('automation_logs')
        .select('*')
        .ilike('message', '%backup%')
        .order('created_at', { ascending: false })
        .limit(1);

      // Calculate metrics
      const completedToday = logsToday?.filter(l => l.status === 'completed').length || 0;
      const failedToday = logsToday?.filter(l => l.status === 'failed').length || 0;
      
      const leadsToday = gmailToday?.filter(m => m.classification === 'lead').length || 0;
      const avgLeadScore = gmailToday?.length 
        ? gmailToday.reduce((sum, m) => sum + (m.lead_score || 0), 0) / gmailToday.length 
        : 0;
      
      const avgProcessingTime = logsToday?.length
        ? logsToday.reduce((sum, l) => sum + (l.execution_time_ms || 0), 0) / logsToday.length
        : 0;

      const lastBackup = backupHistory?.[0];
      const totalSizeMb = lastBackup 
        ? lastBackup.file_size_bytes / (1024 * 1024) 
        : 0;

      const backupStatus = latestBackupLogs?.[0]?.status === 'success' 
        ? 'success' 
        : latestBackupLogs?.[0]?.status === 'failed' 
          ? 'failed' 
          : 'none';

      setMetrics({
        jobs: {
          total: jobs?.length || 0,
          enabled: jobs?.filter(j => j.is_enabled).length || 0,
          running: 0, // Would need active execution tracking
          completed_today: completedToday,
          failed_today: failedToday
        },
        gmail: {
          messages_processed_today: gmailToday?.length || 0,
          leads_found_today: leadsToday,
          avg_lead_score: Math.round(avgLeadScore)
        },
        ai: {
          insights_generated_today: aiInsights?.length || 0,
          commands_processed_today: aiCommands?.filter(c => c.status === 'completed').length || 0,
          avg_processing_time_ms: Math.round(avgProcessingTime)
        },
        backups: {
          last_backup_time: lastBackup?.backup_timestamp || null,
          last_backup_status: backupStatus,
          tables_backed_up: lastBackup ? 1 : 0,
          total_size_mb: totalSizeMb
        }
      });
    } catch (error) {
      console.error('Error fetching automation metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const jobSuccessRate = metrics.jobs.completed_today + metrics.jobs.failed_today > 0
    ? (metrics.jobs.completed_today / (metrics.jobs.completed_today + metrics.jobs.failed_today)) * 100
    : 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automation Metrics</h2>
        <p className="text-muted-foreground">Real-time monitoring of automation system performance</p>
      </div>

      {/* Jobs Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.jobs.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.jobs.enabled} enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.jobs.completed_today}</div>
            <div className="mt-2">
              <Progress value={jobSuccessRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {jobSuccessRate.toFixed(1)}% success rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.jobs.failed_today}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ai.avg_processing_time_ms}ms</div>
            <p className="text-xs text-muted-foreground">
              Average execution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gmail & AI Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail Processing
            </CardTitle>
            <CardDescription>Messages processed today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Messages Processed</span>
              <span className="text-2xl font-bold">{metrics.gmail.messages_processed_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Leads Found</span>
              <span className="text-2xl font-bold text-primary">{metrics.gmail.leads_found_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Lead Score</span>
              <span className="text-2xl font-bold">{metrics.gmail.avg_lead_score}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Processing
            </CardTitle>
            <CardDescription>AI insights and commands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Insights Generated</span>
              <span className="text-2xl font-bold">{metrics.ai.insights_generated_today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Commands Processed</span>
              <span className="text-2xl font-bold">{metrics.ai.commands_processed_today}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Status
          </CardTitle>
          <CardDescription>Latest backup information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Backup</p>
              <p className="text-lg font-semibold">
                {metrics.backups.last_backup_time 
                  ? new Date(metrics.backups.last_backup_time).toLocaleString()
                  : 'No backups yet'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className={`text-lg font-semibold ${
                metrics.backups.last_backup_status === 'success' 
                  ? 'text-green-600' 
                  : metrics.backups.last_backup_status === 'failed' 
                    ? 'text-destructive' 
                    : 'text-muted-foreground'
              }`}>
                {metrics.backups.last_backup_status === 'success' 
                  ? '✓ Success' 
                  : metrics.backups.last_backup_status === 'failed' 
                    ? '✗ Failed' 
                    : 'No data'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Size</p>
              <p className="text-lg font-semibold">
                {metrics.backups.total_size_mb > 0 
                  ? `${metrics.backups.total_size_mb.toFixed(2)} MB` 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationMetrics;
