import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestRequestPanelProps {
  webhookUrl: string;
}

const TestRequestPanel: React.FC<TestRequestPanelProps> = ({ webhookUrl }) => {
  const [command, setCommand] = useState('check system status');
  const [sourceAI, setSourceAI] = useState('test');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateCurlCommand = () => {
    const payload = {
      command,
      source_ai: sourceAI,
      priority,
      dry_run: true
    };

    return `curl -X POST '${webhookUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(payload, null, 2)}'`;
  };

  const testRequest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          source_ai: sourceAI,
          priority,
          dry_run: true
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast({
          title: "Test successful",
          description: "Request processed successfully"
        });
      } else {
        setError(data.error || 'Unknown error');
        toast({
          title: "Test failed",
          description: data.error || 'Request failed',
          variant: "destructive"
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Network error",
        description: err.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "cURL command copied successfully"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Request Panel
          </CardTitle>
          <CardDescription>
            Test your AI Gateway integration with real requests (dry-run mode)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Command</label>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter your command..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source AI</label>
              <Select value={sourceAI} onValueChange={setSourceAI}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="gpt">GPT</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={testRequest} disabled={loading || !command.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Test Request
            </Button>
            <Button variant="outline" onClick={() => copyToClipboard(generateCurlCommand())}>
              <Copy className="h-4 w-4 mr-2" />
              Copy cURL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      {(result || error) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? <XCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="space-y-2">
                <Badge variant="destructive">Error</Badge>
                <div className="bg-destructive/10 p-3 rounded-md text-sm">
                  {error}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={result?.success ? "default" : "destructive"}>
                    {result?.success ? "Success" : "Failed"}
                  </Badge>
                  <Badge variant="outline">
                    {result?.security_status || "Unknown"}
                  </Badge>
                  <Badge variant="secondary">
                    {result?.status || "No Status"}
                  </Badge>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* cURL Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generated cURL Command</CardTitle>
          <CardDescription>
            Use this command to test from your terminal or scripts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {generateCurlCommand()}
            </pre>
          </div>
          <Button 
            variant="outline" 
            className="mt-3 gap-2"
            onClick={() => copyToClipboard(generateCurlCommand())}
          >
            <Copy className="h-4 w-4" />
            Copy cURL Command
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRequestPanel;