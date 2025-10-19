import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";

interface BackupLog {
  id: string;
  created_at: string;
  status: string;
  message: string;
  metadata: any;
}

export default function BackupsDashboard() {
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackupLogs();
  }, []);

  const fetchBackupLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('status', 'success')
        .ilike('message', '%Backup completed%')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setBackups(data as BackupLog[]);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch backup logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerBackup = async () => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke('drive-backup', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Backup Started",
        description: "Backup process initiated successfully"
      });

      // Refresh logs after 5 seconds
      setTimeout(fetchBackupLogs, 5000);
    } catch (error) {
      console.error('Error triggering backup:', error);
      toast({
        title: "Error",
        description: "Failed to trigger backup",
        variant: "destructive"
      });
    } finally {
      setTriggering(false);
    }
  };

  const lastBackup = backups[0];
  const daysSinceLastBackup = lastBackup
    ? Math.floor((Date.now() - new Date(lastBackup.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <PageLayout>
      <SEO 
        title="Backup Dashboard - Co-Evolve Network"
        description="Monitor and manage automated database backups to Google Drive"
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Backup Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor automated backups and ensure data security
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {lastBackup ? (
                <>
                  <div className="text-2xl font-bold">
                    {daysSinceLastBackup === 0 ? 'Today' : `${daysSinceLastBackup}d ago`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lastBackup.created_at), 'PPp')}
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No backups yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {daysSinceLastBackup !== null && daysSinceLastBackup < 2 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {daysSinceLastBackup !== null && daysSinceLastBackup < 2 ? (
                  <Badge variant="default" className="bg-green-500">Healthy</Badge>
                ) : (
                  <Badge variant="destructive">Needs Backup</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Daily backups recommended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backups.length}</div>
              <p className="text-xs text-muted-foreground">30-day retention</p>
            </CardContent>
          </Card>
        </div>

        {/* Manual Trigger */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manual Backup</CardTitle>
            <CardDescription>
              Trigger an immediate backup to Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={triggerBackup}
              disabled={triggering}
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {triggering ? 'Backing up...' : 'Trigger Backup Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>Recent backup operations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No backups found. Trigger your first backup above.
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div 
                    key={backup.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {format(new Date(backup.created_at), 'PPp')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {backup.message}
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    </div>
                    
                    {backup.metadata && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Tables</div>
                          <div className="font-medium">{backup.metadata.tables?.length || 0}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Rows</div>
                          <div className="font-medium">
                            {backup.metadata.tables?.reduce((sum, t) => sum + t.rowCount, 0) || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Size</div>
                          <div className="font-medium">
                            {formatBytes(backup.metadata.totalSize || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Timestamp</div>
                          <div className="font-medium text-xs">
                            {backup.metadata.timestamp ? 
                              format(new Date(backup.metadata.timestamp), 'HH:mm:ss') : 
                              'N/A'
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
