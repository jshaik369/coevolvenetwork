import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, Settings, Eye, Calendar, Shield, AlertTriangle, CheckCircle, Zap, TestTube } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

interface AutomationJob {
  id: string;
  name: string;
  description: string;
  job_type: string;
  schedule_cron: string | null;
  is_enabled: boolean;
  dry_run_enabled: boolean;
  config: any;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

interface AutomationLog {
  id: string;
  job_id: string | null;
  execution_id: string;
  status: string;
  log_level: string;
  message: string;
  metadata: any;
  execution_time_ms: number | null;
  created_at: string;
  created_by: string | null;
}

const AutomationDashboard = () => {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
    loadLogs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading jobs",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runJob = async (jobId: string) => {
    try {
      const response = await supabase.functions.invoke('automation-orchestrator', {
        body: {
          action: 'run_job',
          jobId
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Job Started",
        description: "Automation job has been triggered successfully",
      });

      // Refresh data
      loadJobs();
      loadLogs();
    } catch (error: any) {
      toast({
        title: "Error running job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleJobEnabled = async (jobId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_jobs')
        .update({ is_enabled: enabled })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: enabled ? "Job Enabled" : "Job Disabled",
        description: `Automation job has been ${enabled ? 'enabled' : 'disabled'}`,
      });

      loadJobs();
    } catch (error: any) {
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleDryRun = async (jobId: string, dryRun: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_jobs')
        .update({ dry_run_enabled: dryRun })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: dryRun ? "Dry Run Enabled" : "Dry Run Disabled",
        description: `Job will ${dryRun ? 'simulate' : 'execute'} actions`,
      });

      loadJobs();
    } catch (error: any) {
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const runSelfTest = async () => {
    try {
      const response = await supabase.functions.invoke('system-self-test');
      
      if (response.error) throw response.error;
      
      const results = response.data;
      const overallStatus = results.overall_status;
      
      toast({
        title: `System Self-Test ${overallStatus === 'pass' ? 'Passed' : 'Issues Found'}`,
        description: `${results.results.filter(r => r.status === 'pass').length}/${results.results.length} tests passed`,
        variant: overallStatus === 'fail' ? 'destructive' : 'default'
      });
      
      loadLogs(); // Refresh to show test results
    } catch (error: any) {
      toast({
        title: "Self-test failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'perplexity_insights':
        return '🧠';
      case 'gmail_processor':
        return '📧';
      case 'business_intelligence':
        return '📊';
      case 'weekly_report':
        return '📋';
      case 'market_analysis':
        return '📈';
      case 'lead_scoring':
        return '🎯';
      default:
        return '⚡';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'started':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageLayout showContact={false}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">C.E.Network Control Center</h1>
            <p className="text-muted-foreground">
              Forensic-grade automation for UHNW client services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={runSelfTest}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Self-Test
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">CIA-Level Security</span>
            </div>
          </div>
        </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">Automation Jobs</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getJobTypeIcon(job.job_type)}</span>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {job.name}
                          {job.dry_run_enabled && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              DRY RUN
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={job.is_enabled}
                        onCheckedChange={(checked) => toggleJobEnabled(job.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runJob(job.id)}
                        disabled={!job.is_enabled}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Schedule:</span>
                      <p className="text-muted-foreground">
                        {job.schedule_cron || 'Manual only'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Last Run:</span>
                      <p className="text-muted-foreground">
                        {job.last_run_at
                          ? new Date(job.last_run_at).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span>
                      <p className="text-muted-foreground">
                        {job.next_run_at
                          ? new Date(job.next_run_at).toLocaleDateString()
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Dry Run:</span>
                      <Switch
                        checked={job.dry_run_enabled}
                        onCheckedChange={(checked) => toggleDryRun(job.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Execution Logs</CardTitle>
              <CardDescription>
                Complete audit trail of all automation executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground"
                    >
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="font-medium">{log.message}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                          {log.execution_time_ms && (
                            <span className="ml-2">
                              • {log.execution_time_ms}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights Overview</CardTitle>
              <CardDescription>
                Recent intelligence generated by your automation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>AI insights will appear here as jobs generate intelligence</p>
                <p className="text-sm mt-2">Run the Perplexity Insights job to see results</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Compliance Controls</CardTitle>
              <CardDescription>
                Manage data collection, consent, and forensic logging settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Forensic Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      Immutable logs for compliance and security review
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    ACTIVE
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Encryption</h4>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encryption for sensitive data
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    ENABLED
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Admin-Only Access</h4>
                    <p className="text-sm text-muted-foreground">
                      All automation data requires admin privileges
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    ENFORCED
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Privacy Notice</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This system processes business data in compliance with privacy regulations. 
                    All operations are logged for forensic analysis and security auditing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </PageLayout>
  );
};

export default AutomationDashboard;