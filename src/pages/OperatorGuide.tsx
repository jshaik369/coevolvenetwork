import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Play, Shield, Book, Terminal, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import KnowledgeExport from '@/components/KnowledgeExport';

const OperatorGuide = () => {
  const [selfTestRunning, setSelfTestRunning] = useState(false);
  const [selfTestResults, setSelfTestResults] = useState<any>(null);

  const runSelfTest = async () => {
    setSelfTestRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-self-test');
      if (error) throw error;
      setSelfTestResults(data);
      toast({
        title: "Self-test completed",
        description: "System diagnostics have been run successfully."
      });
    } catch (error) {
      console.error('Self-test failed:', error);
      toast({
        title: "Self-test failed",
        description: "Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setSelfTestRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard."
    });
  };

  const quickLinks = [
    {
      title: "Supabase Dashboard",
      url: "https://supabase.com/dashboard/project/gvmmwtfavsrhtaqqybbu",
      description: "Main project dashboard"
    },
    {
      title: "Edge Functions",
      url: "https://supabase.com/dashboard/project/gvmmwtfavsrhtaqqybbu/functions",
      description: "View and manage Edge Functions"
    },
    {
      title: "Function Logs",
      url: "https://supabase.com/dashboard/project/gvmmwtfavsrhtaqqybbu/functions",
      description: "Monitor function execution logs"
    },
    {
      title: "Database",
      url: "https://supabase.com/dashboard/project/gvmmwtfavsrhtaqqybbu/editor",
      description: "SQL Editor and table management"
    },
    {
      title: "Users & Auth",
      url: "https://supabase.com/dashboard/project/gvmmwtfavsrhtaqqybbu/auth/users",
      description: "User management and authentication"
    }
  ];

  const assistantPrompts = [
    {
      category: "System Operations",
      prompts: [
        "Run full system diagnostics",
        "Backup all data to Google Drive",
        "Show me today's automation status",
        "Generate weekly intelligence report",
        "Check system security posture"
      ]
    },
    {
      category: "Analytics & Intelligence",
      prompts: [
        "Analyze website performance trends",
        "Generate business intelligence summary",
        "Show user engagement patterns",
        "Create competitive analysis report",
        "Identify security anomalies"
      ]
    },
    {
      category: "Automation Management",
      prompts: [
        "Enable all automation jobs",
        "Disable Gmail processing temporarily",
        "Schedule backup for tonight",
        "Run perplexity analysis on recent data",
        "Check automation job health"
      ]
    }
  ];

  const runbooks = [
    {
      title: "Daily Operations Checklist",
      items: [
        "Check automation dashboard for failed jobs",
        "Review overnight analytics collection",
        "Verify backup completion status",
        "Check AI insights for actionable items",
        "Review privacy compliance metrics"
      ]
    },
    {
      title: "Weekly Maintenance",
      items: [
        "Run full system self-test",
        "Review and archive old AI insights",
        "Check Google Drive backup integrity",
        "Analyze performance trends",
        "Update automation job configurations"
      ]
    },
    {
      title: "Security Incident Response",
      items: [
        "Immediately check audit ledger for anomalies",
        "Review recent authentication logs",
        "Verify admin access patterns",
        "Check automation job execution logs",
        "Generate security incident report"
      ]
    }
  ];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">C.E.Network Operator Guide</h1>
          <p className="text-muted-foreground">Comprehensive operations manual for Swiss-grade business intelligence</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="self-test">Self-Test</TabsTrigger>
            <TabsTrigger value="runbooks">Runbooks</TabsTrigger>
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
            <TabsTrigger value="links">Quick Links</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Security Level</h3>
                    <Badge variant="default" className="mt-2">CIA-Grade</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Compliance</h3>
                    <Badge variant="secondary" className="mt-2">Swiss FINMA</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Architecture</h3>
                    <Badge variant="outline" className="mt-2">Forensic-Ready</Badge>
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This system handles UHNW client data. All operations are logged and auditable. Ensure proper authorization before accessing sensitive functions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <KnowledgeExport />
          </TabsContent>

          <TabsContent value="self-test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  System Self-Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Button 
                    onClick={runSelfTest} 
                    disabled={selfTestRunning}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {selfTestRunning ? 'Running...' : 'Run Full Diagnostics'}
                  </Button>
                  <Badge variant={selfTestResults?.overall_status === 'pass' ? 'default' : 'destructive'}>
                    {selfTestResults?.overall_status || 'Not Run'}
                  </Badge>
                </div>

                {selfTestResults && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Test Results</h3>
                    {selfTestResults.results?.map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{result.component}</span>
                        <Badge variant={result.status === 'pass' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runbooks" className="space-y-4">
            {runbooks.map((runbook, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    {runbook.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {runbook.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="assistant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Assistant Command Library
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {assistantPrompts.map((category, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-3">{category.category}</h3>
                    <div className="grid gap-2">
                      {category.prompts.map((prompt, promptIndex) => (
                        <div key={promptIndex} className="flex items-center justify-between p-2 border rounded">
                          <code className="text-sm">{prompt}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(prompt)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="grid gap-4">
              {quickLinks.map((link, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default OperatorGuide;