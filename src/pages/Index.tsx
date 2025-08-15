
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
        title="Co-Evolve Network - Global Platform for AI-Augmented Creators" 
        description="Connect creators worldwide through accountability partnerships, pitch feedback, and verifiable outcomes in the AI creator economy."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={['AI creators', 'accountability partnerships', 'creator economy', 'Barcelona', 'Bangalore', 'AI collaboration']}
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
