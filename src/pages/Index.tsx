
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import LiveStats from '@/components/LiveStats';
import BarcelonaHub from '@/components/BarcelonaHub';
import CommunityHub from '@/components/CommunityHub';
import CreatorSpotlight from '@/components/CreatorSpotlight';
import ProofOfOutcome from '@/components/ProofOfOutcome';
import Resources from '@/components/Resources';
import PressKit from '@/components/PressKit';
import EmailSignup from '@/components/EmailSignup';
import Contact from '@/components/Contact';
import SEO from '@/components/SEO';
import { LanguageProvider } from '@/hooks/useLanguage';
import { useEffect } from 'react';

const Index = () => {
  // Analytics tracking
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_TRACKING_ID', {
        page_title: 'Co-Evolve Network',
        page_location: window.location.href,
      });
    }
  }, []);

  return (
    <LanguageProvider>
      <div className="bg-black min-h-screen">
        <SEO 
          title="Co-Evolve Network - Architecting Sovereign Independence" 
          description="Co-Evolve Network: A global community foundry building tools and ventures for AI-augmented creators. From Barcelona to Bangalore."
          imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
          keywords={['sovereign creators', 'AI collaboration', 'community foundry', 'Barcelona hub', 'startup insights', 'AI adoption']}
        />
        <Hero />
        <Mission />
        <CreatorSpotlight />
        <ProofOfOutcome />
        <LiveStats />
        <BarcelonaHub />
        <CommunityHub />
        <Resources />
        <PressKit />
        <EmailSignup />
        <Contact />
      </div>
    </LanguageProvider>
  );
};

export default Index;
