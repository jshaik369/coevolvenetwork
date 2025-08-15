import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Terminal, Zap } from 'lucide-react';
import { toast } from 'sonner';

const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`> ACCESS GRANTED: ${email} added to co-evolution network`, {
      description: "Welcome to the terminal, creator. Your neural pathways are now connected.",
    });
    
    setEmail('');
    setIsLoading(false);
  };

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Terminal className="h-5 w-5" />
          {'>'} INITIALIZE_CONNECTION.exe
        </CardTitle>
        <CardDescription className="font-mono text-sm">
          Enter your neural interface identifier to join the co-evolution matrix
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">
              {'>'} EMAIL_ADDRESS:
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="creator@domain.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 font-mono bg-input border-primary/30 focus:border-primary"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !email}
            className="w-full font-mono"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                CONNECTING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                CONNECT_TO_NETWORK
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailSignup;