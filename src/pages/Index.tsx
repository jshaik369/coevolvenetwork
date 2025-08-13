
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import EmailSignup from '@/components/EmailSignup';
import Contact from '@/components/Contact';
import SEO from '@/components/SEO';
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
    <div className="bg-black min-h-screen">
      <SEO 
        title="Co-Evolve Network - Architecting Sovereign Independence" 
        description="Co-Evolve Network: A foundry for the tools, ventures, and community that will power the next generation of AI-augmented creators."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={['sovereign creators', 'AI augmentation', 'venture foundry', 'independent creators', 'co-evolution', 'network']}
      />
      <Hero />
      <Mission />
      <EmailSignup />
      <Contact />
    </div>
  );
};

export default Index;
