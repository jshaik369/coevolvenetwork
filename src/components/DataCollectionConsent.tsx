import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Database, Users, Brain } from 'lucide-react';

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
    humanDevelopment: false
  });

  useEffect(() => {
    const existingConsent = localStorage.getItem('coevolve-data-consent');
    if (!existingConsent) {
      setShowConsent(true);
    }
  }, []);

  const handleConsentSubmit = () => {
    localStorage.setItem('coevolve-data-consent', JSON.stringify(consent));
    localStorage.setItem('coevolve-consent-timestamp', Date.now().toString());
    setShowConsent(false);
    
    // Initialize analytics based on consent
    // @ts-ignore
    window.coEvolveConsent = consent;
  };

  const updateConsent = (key: keyof ConsentOptions, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Help Us Study Human Co-Evolution
          </CardTitle>
          <CardDescription>
            Co-Evolve Network is researching how humans and AI collaborate to push the boundaries of creativity and innovation. 
            Your participation helps us understand human potential in the AI age.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="basic"
                checked={consent.basicAnalytics}
                onCheckedChange={(checked) => updateConsent('basicAnalytics', checked as boolean)}
              />
              <div className="space-y-1">
                <label htmlFor="basic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Basic Website Analytics
                </label>
                <p className="text-xs text-muted-foreground">
                  Page views, session duration, basic navigation patterns. Standard website optimization data.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="behavior"
                checked={consent.advancedBehavior}
                onCheckedChange={(checked) => updateConsent('advancedBehavior', checked as boolean)}
              />
              <div className="space-y-1 flex-1">
                <label htmlFor="behavior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Advanced Behavioral Research
                </label>
                <p className="text-xs text-muted-foreground">
                  Mouse movements, click patterns, scroll behavior, decision-making patterns. 
                  Helps us understand how humans process information and make creative decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="collaboration"
                checked={consent.collaborationStudy}
                onCheckedChange={(checked) => updateConsent('collaborationStudy', checked as boolean)}
              />
              <div className="space-y-1 flex-1">
                <label htmlFor="collaboration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Cross-Cultural Collaboration Study
                </label>
                <p className="text-xs text-muted-foreground">
                  Communication patterns, cultural preferences, collaboration styles. 
                  Helps optimize India-Barcelona and global creator partnerships.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="development"
                checked={consent.humanDevelopment}
                onCheckedChange={(checked) => updateConsent('humanDevelopment', checked as boolean)}
              />
              <div className="space-y-1 flex-1">
                <label htmlFor="development" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Human Development Research
                </label>
                <p className="text-xs text-muted-foreground">
                  Skill progression, learning patterns, adaptation strategies, resilience factors. 
                  Contributes to understanding human potential in AI-augmented environments.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Data Protection Guarantee</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All data is encrypted and anonymized</li>
              <li>• You can withdraw consent and delete your data anytime</li>
              <li>• Data is used only for research, never sold to third parties</li>
              <li>• Full GDPR compliance with data ownership rights</li>
              <li>• Research findings will be shared openly with the community</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleConsentSubmit}
              className="flex-1"
              disabled={!Object.values(consent).some(Boolean)}
            >
              Continue with Selected Preferences
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setConsent({
                  basicAnalytics: true,
                  advancedBehavior: false,
                  collaborationStudy: false,
                  humanDevelopment: false
                });
                handleConsentSubmit();
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