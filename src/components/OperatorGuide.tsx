import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Shield, Brain, Zap, Globe, Code, FileText, ExternalLink, Play, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TestRequestPanel from './TestRequestPanel';

const OperatorGuide = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: `${section} copied successfully`
    });
  };

  const webhookUrl = "https://joovupvjegfnjgkyxekf.supabase.co/functions/v1/ai-command-gateway";
  const hmacSecret = "change-this-to-your-secure-secret";

  const perplexityPrompt = `You are an AI operator for the CoEvolve Network automation platform. I will give you natural language commands that you should convert into API calls to execute business automation tasks.

**Your Capabilities:**
- Backup data to Google Drive
- Generate AI insights and market analysis  
- Check system status and health
- Review privacy compliance
- Execute custom automation jobs
- Natural language command processing

**API Endpoint:** ${webhookUrl}

**Required Headers:**
- Content-Type: application/json
- x-signature: HMAC-SHA256 signature
- x-timestamp: Unix timestamp in milliseconds

**Example Commands You Can Process:**
- "Backup all data to Google Drive"
- "Analyze recent business trends"
- "Check system status"
- "Generate weekly report"
- "Review privacy compliance"

**Response Format:**
When I give you a command, make an HTTP POST request to the webhook URL with this structure:
\`\`\`json
{
  "command": "user's natural language command",
  "source_ai": "perplexity",
  "priority": "normal",
  "dry_run": false,
  "metadata": {
    "user_context": "relevant context",
    "timestamp": "ISO timestamp"
  }
}
\`\`\`

**Important Security Notes:**
- All requests require HMAC signature verification
- Commands are sanitized for security
- High-risk commands require admin approval
- All interactions are logged for audit trails

Ready to assist with your automation needs!`;

  const geminiPrompt = `# CoEvolve Network AI Assistant

You are an intelligent operator for the CoEvolve Network business automation platform. Your role is to help execute commands through a secure AI gateway.

## Platform Overview
CoEvolve Network provides CIA-level security automation for business intelligence, data backup, and process management. The platform uses forensic-grade logging and immutable audit trails.

## Your Capabilities
🔧 **System Operations**
- Data backup to Google Drive with retention policies
- System health monitoring and status checks
- Performance metrics and analytics review

🧠 **AI Intelligence**  
- Market trend analysis using Perplexity AI
- Business intelligence generation
- Competitive landscape research

🛡️ **Security & Compliance**
- Privacy audit and GDPR compliance review
- Forensic logging and audit trail management
- Risk assessment and threat monitoring

## Communication Protocol
**Webhook URL:** ${webhookUrl}

**Request Format:**
\`\`\`json
{
  "command": "natural language command",
  "source_ai": "gemini", 
  "priority": "normal|high|urgent",
  "session_id": "unique-session-id",
  "dry_run": false,
  "metadata": {
    "context": "additional context",
    "user_intent": "parsed intent"
  }
}
\`\`\`

## Example Interactions
**User:** "I need a complete backup of all business data"
**Your Action:** POST to webhook with command: "backup all business data with 7 year retention"

**User:** "What's our current system status?"  
**Your Action:** POST to webhook with command: "check system status and health metrics"

## Security Requirements
- Always include HMAC signature in x-signature header
- Include current timestamp in x-timestamp header  
- Sanitize commands to prevent injection attacks
- Log all interactions for compliance auditing

## Response Handling
The webhook will return status updates and execution results. Always relay the platform's response back to the user with clear explanations of what was accomplished.

Ready to help you manage your automation platform securely and efficiently!`;

  const hmacCodeExample = `// HMAC Signature Generation Example (Node.js)
const crypto = require('crypto');

function generateHMACSignature(body, timestamp, secret) {
  const payload = timestamp + body;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature;
}

// Usage
const body = JSON.stringify({
  command: "backup all data",
  source_ai: "perplexity",
  priority: "normal"
});

const timestamp = Date.now().toString();
const signature = generateHMACSignature(body, timestamp, '${hmacSecret}');

// Include in headers:
// x-signature: signature
// x-timestamp: timestamp`;

  const pythonExample = `# Python HMAC Example
import hmac
import hashlib
import time
import json
import requests

def generate_hmac_signature(body, timestamp, secret):
    payload = timestamp + body
    signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

# Example usage
webhook_url = "${webhookUrl}"
secret = "${hmacSecret}"

data = {
    "command": "analyze business trends",
    "source_ai": "python_client",
    "priority": "normal",
    "dry_run": False
}

body = json.dumps(data)
timestamp = str(int(time.time() * 1000))
signature = generate_hmac_signature(body, timestamp, secret)

headers = {
    'Content-Type': 'application/json',
    'x-signature': signature,
    'x-timestamp': timestamp
}

response = requests.post(webhook_url, data=body, headers=headers)
print(response.json())`;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          AI Operator Guide
        </h1>
        <p className="text-muted-foreground text-lg">
          Connect your AI assistants to CoEvolve Network's automation platform
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            CIA-Level Security
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            Natural Language Processing
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Real-time Automation
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="perplexity">Perplexity Setup</TabsTrigger>
          <TabsTrigger value="gemini">Gemini Setup</TabsTrigger>
          <TabsTrigger value="technical">Technical Integration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Public Knowledge Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share this URL with your AI assistants to give them context about your platform:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  https://your-domain.com/operator-guide
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(window.location.href, "Knowledge Link")}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedSection === "Knowledge Link" ? "Copied!" : "Copy Link"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="text-sm space-y-2">
                  <li>1. Choose your AI platform (Perplexity/Gemini)</li>
                  <li>2. Copy the integration prompt</li>
                  <li>3. Configure HMAC security (production)</li>
                  <li>4. Test with a simple command</li>
                  <li>5. Monitor execution in the dashboard</li>
                </ol>
                <Button variant="default" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">🔧 System Operations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Google Drive backups</li>
                    <li>• System health monitoring</li>
                    <li>• Performance analytics</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🧠 AI Intelligence</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Market trend analysis</li>
                    <li>• Business intelligence</li>
                    <li>• Competitive research</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🛡️ Security & Compliance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Privacy audits</li>
                    <li>• Forensic logging</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perplexity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Perplexity Pro Integration
              </CardTitle>
              <CardDescription>
                Copy this prompt to your Perplexity Pro conversation to enable automation control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {perplexityPrompt}
                </pre>
              </div>
              <Button 
                onClick={() => copyToClipboard(perplexityPrompt, "Perplexity Prompt")}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copiedSection === "Perplexity Prompt" ? "Copied!" : "Copy Perplexity Prompt"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gemini" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Google Gemini Integration
              </CardTitle>
              <CardDescription>
                Use this prompt with Gemini Advanced or Gemini API for automation control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {geminiPrompt}
                </pre>
              </div>
              <Button 
                onClick={() => copyToClipboard(geminiPrompt, "Gemini Prompt")}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copiedSection === "Gemini Prompt" ? "Copied!" : "Copy Gemini Prompt"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Endpoint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">{webhookUrl}</code>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Method:</strong> POST<br/>
                  <strong>Content-Type:</strong> application/json<br/>
                  <strong>Authentication:</strong> HMAC-SHA256 signature
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Node.js Integration Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {hmacCodeExample}
                  </pre>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(hmacCodeExample, "Node.js Code")}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedSection === "Node.js Code" ? "Copied!" : "Copy Node.js Code"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Python Integration Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {pythonExample}
                  </pre>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(pythonExample, "Python Code")}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedSection === "Python Code" ? "Copied!" : "Copy Python Code"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <TestRequestPanel webhookUrl={webhookUrl} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                CIA-Level Security Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">🔒 Confidentiality</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• HMAC-SHA256 signatures</li>
                    <li>• Admin-only access control</li>
                    <li>• Encrypted secret storage</li>
                    <li>• PII redaction in logs</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">🔍 Integrity</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Immutable audit logs</li>
                    <li>• Hash-chained triggers</li>
                    <li>• Input validation & sanitization</li>
                    <li>• Replay attack prevention</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-600">⚡ Availability</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dry-run mode testing</li>
                    <li>• Automated retry logic</li>
                    <li>• Health monitoring</li>
                    <li>• Backup & redundancy</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">🚨 Production Security Checklist</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✓ Change default HMAC secret key</li>
                  <li>✓ Enable signature verification in production</li>
                  <li>✓ Configure proper CORS policies</li>
                  <li>✓ Set up monitoring and alerting</li>
                  <li>✓ Regular security audits and penetration testing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperatorGuide;