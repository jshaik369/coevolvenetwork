import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Users, BarChart3, Eye, Shield, Lock } from 'lucide-react';

interface ConsentOptions {
  basicAnalytics: boolean;
  advancedBehavior: boolean;
  collaborationStudy: boolean;
  humanDevelopment: boolean;
}

const DataCollectionConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [consent, setConsent] = useState<ConsentOptions>({
    basicAnalytics: false,
    advancedBehavior: false,
    collaborationStudy: false,
    humanDevelopment: false,
  });

  useEffect(() => {
    const existingConsent = localStorage.getItem('coEvolveConsent');
    if (!existingConsent) {
      setShowConsent(true);
    }
  }, []);

  const handleConsentSubmit = () => {
    const consentData = {
      ...consent,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('coEvolveConsent', JSON.stringify(consentData));
    
    if (typeof window !== 'undefined') {
      (window as any).coEvolveConsent = consentData;
    }
    
    setShowConsent(false);
  };

  const updateConsent = (key: keyof ConsentOptions, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }));
  };

  const hasAnyConsent = Object.values(consent).some(value => value);

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Co-Evolution Research Participation
          </CardTitle>
          <CardDescription>
            Help us understand how AI-augmented creators collaborate and co-evolve. Your participation enables groundbreaking research into human-AI partnership dynamics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="basicAnalytics"
                checked={consent.basicAnalytics}
                onCheckedChange={(checked) => updateConsent('basicAnalytics', checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="basicAnalytics" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Basic Analytics
                </label>
                <p className="text-xs text-muted-foreground">
                  Page views, session duration, basic interaction patterns for platform improvement
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="advancedBehavior"
                checked={consent.advancedBehavior}
                onCheckedChange={(checked) => updateConsent('advancedBehavior', checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="advancedBehavior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Advanced Behavioral Patterns
                </label>
                <p className="text-xs text-muted-foreground">
                  Mouse movements, scroll patterns, attention heatmaps for UX research
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="collaborationStudy"
                checked={consent.collaborationStudy}
                onCheckedChange={(checked) => updateConsent('collaborationStudy', checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="collaborationStudy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Collaboration Study
                </label>
                <p className="text-xs text-muted-foreground">
                  Partnership formation patterns, communication styles, project outcomes
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="humanDevelopment"
                checked={consent.humanDevelopment}
                onCheckedChange={(checked) => updateConsent('humanDevelopment', checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="humanDevelopment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Human Development Research
                </label>
                <p className="text-xs text-muted-foreground">
                  Skill progression, learning patterns, AI-augmentation effects on creative development
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4" />
              Data Protection Guarantee
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All data is anonymized and encrypted</li>
              <li>• No personal information is stored without explicit consent</li>
              <li>• Data is used solely for academic research purposes</li>
              <li>• You can withdraw consent at any time</li>
              <li>• Research findings will be shared openly with the community</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setConsent({ basicAnalytics: true, advancedBehavior: true, collaborationStudy: true, humanDevelopment: true });
                setTimeout(handleConsentSubmit, 100);
              }}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Accept All
            </Button>
            <Button 
              onClick={handleConsentSubmit}
              disabled={!hasAnyConsent}
              variant="outline"
              className="flex-1"
            >
              Continue with Selected
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setConsent({ basicAnalytics: true, advancedBehavior: false, collaborationStudy: false, humanDevelopment: false });
                setTimeout(handleConsentSubmit, 100);
              }}
              className="flex-1"
            >
              Essential Only
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCollectionConsent;