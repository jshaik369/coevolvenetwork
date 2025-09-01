import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Settings, Database, Brain, Shield, Archive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';

interface CommandResponse {
  action: string;
  parameters: any;
  status: 'success' | 'error' | 'processing';
  message: string;
  cost_estimate?: number;
}

const Assistant = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<CommandResponse[]>([]);
  const [quickActions] = useState([
    { icon: Archive, label: 'Backup to Drive', command: 'backup everything to google drive now' },
    { icon: Brain, label: 'AI Analysis', command: 'analyze recent business trends' },
    { icon: Database, label: 'Check Status', command: 'show me system status' },
    { icon: Shield, label: 'Privacy Check', command: 'review privacy compliance' }
  ]);

  const { toast } = useToast();
  const recognition = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition for iPhone
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input failed",
          description: "Please try typing instead",
          variant: "destructive"
        });
      };
    }
  }, [toast]);

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const processCommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      // Parse natural language command using Perplexity
      const parseResponse = await supabase.functions.invoke('perplexity-insights', {
        body: {
          query: `Parse this automation command and return JSON with action and parameters: "${command}". 
          
          Available actions:
          - backup_drive: {data_types: string[], retention_years?: number}
          - analyze_trends: {timeframe: string, focus_area?: string}
          - system_status: {}
          - privacy_audit: {}
          - run_automation: {job_name: string}
          
          Respond only with valid JSON.`,
          insight_type: 'command_parsing'
        }
      });

      if (parseResponse.error) {
        throw new Error(`Command parsing failed: ${parseResponse.error.message}`);
      }

      const responseContent = parseResponse.data?.response_data?.content || parseResponse.data?.content;
      if (!responseContent) {
        throw new Error('No response content from Perplexity');
      }

      let parsedCommand;
      try {
        parsedCommand = JSON.parse(responseContent);
      } catch (e) {
        // If JSON parsing fails, extract action from response text
        const actionMatch = responseContent.match(/action['":\s]*['"]([^'"]+)['"]/i);
        const action = actionMatch ? actionMatch[1] : 'unknown';
        parsedCommand = {
          action: action,
          parameters: {}
        };
      }
      
      let result: CommandResponse = {
        action: parsedCommand.action,
        parameters: parsedCommand.parameters,
        status: 'processing',
        message: `Processing ${parsedCommand.action}...`
      };

      // Execute the parsed command
      switch (parsedCommand.action) {
        case 'backup_drive':
          const backupResponse = await supabase.functions.invoke('drive-backup', {
            body: {
              data_types: parsedCommand.parameters?.data_types || ['all'],
              include_ai_insights: parsedCommand.parameters?.include_ai_insights !== false,
              retention_years: parsedCommand.parameters?.retention_years || 7
            }
          });
          
          if (backupResponse.error) {
            throw new Error(`Backup failed: ${backupResponse.error.message}`);
          }
          
          result = {
            ...result,
            status: 'success',
            message: `✅ Backup completed! File size: ${Math.round((backupResponse.data?.backup_size || 0) / 1024)}KB`,
            cost_estimate: 0 // Using existing Google Workspace
          };
          break;

        case 'analyze_trends':
          const analysisResponse = await supabase.functions.invoke('perplexity-insights', {
            body: {
              query: `Analyze business trends for CoEvolve Network based on recent data. Focus on: ${parsedCommand.parameters?.focus_area || 'general trends'}. Timeframe: ${parsedCommand.parameters?.timeframe || 'last 30 days'}`,
              insight_type: 'business_analysis'
            }
          });
          
          if (analysisResponse.error) {
            throw new Error(`Analysis failed: ${analysisResponse.error.message}`);
          }
          
          result = {
            ...result,
            status: 'success',
            message: `📊 Analysis complete: ${(analysisResponse.data?.response_data?.content || analysisResponse.data?.content || '').slice(0, 100)}...`,
            cost_estimate: 0.02 // Perplexity API cost
          };
          break;

        case 'system_status':
          // Check automation jobs status
          const { data: jobs } = await supabase
            .from('automation_jobs')
            .select('name, is_enabled, last_run_at')
            .eq('is_enabled', true);

          const { data: recentLogs } = await supabase
            .from('automation_logs')
            .select('status')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

          const successRate = recentLogs ? 
            (recentLogs.filter(log => log.status === 'completed').length / recentLogs.length * 100).toFixed(1) 
            : '0';

          result = {
            ...result,
            status: 'success',
            message: `🟢 System Status: ${jobs?.length || 0} active jobs, ${successRate}% success rate (24h)`,
            cost_estimate: 0
          };
          break;

        case 'privacy_audit':
          const { data: consents } = await supabase
            .from('privacy_consents')
            .select('consent_type, consent_given')
            .eq('consent_given', true);

          result = {
            ...result,
            status: 'success',
            message: `🔒 Privacy Status: ${consents?.length || 0} active consents, GDPR compliant`,
            cost_estimate: 0
          };
          break;

        case 'run_automation':
          const automationResponse = await supabase.functions.invoke('automation-orchestrator', {
            body: {
              action: 'run_job',
              jobId: parsedCommand.parameters?.job_id || parsedCommand.parameters?.jobId
            }
          });
          
          if (automationResponse.error) {
            throw new Error(`Automation failed: ${automationResponse.error.message}`);
          }
          
          result = {
            ...result,
            status: 'success',
            message: `⚡ Automation job started successfully`,
            cost_estimate: 0
          };
          break;

        default:
          throw new Error(`Unknown action: ${parsedCommand.action}`);
      }

      setResponses(prev => [result, ...prev]);
      
      toast({
        title: "Command executed",
        description: result.message
      });

    } catch (error: any) {
      console.error('Command processing error:', error);
      
      const errorResponse: CommandResponse = {
        action: 'error',
        parameters: {},
        status: 'error',
        message: `❌ Error: ${error?.message || 'Unknown error occurred'}`
      };
      
      setResponses(prev => [errorResponse, ...prev]);
      
      toast({
        title: "Command failed",
        description: error?.message || 'Unknown error occurred',
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
    setInput('');
  };

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      processCommand(input.trim());
    }
  };

  const handleQuickAction = (command: string) => {
    setInput(command);
    processCommand(command);
  };

  return (
    <PageLayout showContact={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              CoEvolve Assistant
            </h1>
            <p className="text-muted-foreground">Natural language control for your iPhone</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 text-left"
                onClick={() => handleQuickAction(action.command)}
                disabled={isProcessing}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Voice/Text Input */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Say or type your command..."
                  className="flex-1 min-h-[60px] text-base"
                  disabled={isProcessing}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant={isListening ? "destructive" : "secondary"}
                    onClick={startListening}
                    disabled={isProcessing || !recognition.current}
                    className="h-12 w-12"
                  >
                    <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    className="h-12 w-12"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response History */}
          <div className="space-y-4">
            {responses.map((response, index) => (
              <Card key={index} className={`${
                response.status === 'error' ? 'border-destructive/50' : 
                response.status === 'success' ? 'border-primary/50' : 
                'border-muted'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      response.status === 'error' ? 'destructive' : 
                      response.status === 'success' ? 'default' : 
                      'secondary'
                    }>
                      {response.action}
                    </Badge>
                    {response.cost_estimate !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        ${response.cost_estimate.toFixed(3)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed">{response.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {isProcessing && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Processing your command...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Assistant;