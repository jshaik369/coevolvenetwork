
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import Contact from '@/components/Contact';
import UserAnalytics from '@/components/UserAnalytics';
import DataCollectionConsent from '@/components/DataCollectionConsent';
import SEO from '@/components/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Co-Evolve Network - AI Creator Platform | Join Global Accountability Partnerships" 
        description="Join 500+ AI creators in Barcelona and Bangalore. Free accountability partnerships, expert pitch feedback, and verifiable outcomes. Start building your creator journey today."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={[
          'AI creator platform',
          'accountability partnerships',
          'creator economy 2025',
          'Barcelona creator network',
          'Bangalore AI community',
          'free creator platform',
          'AI collaboration',
          'creator mentorship',
          'pitch feedback',
          'creator accountability'
        ]}
      />
      <DataCollectionConsent />
      <UserAnalytics collectAdvancedMetrics={true} />
      <Hero />
      <Mission />
      <Contact />
    </div>
  );
};

export default Index;
