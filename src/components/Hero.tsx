import CobeGlobe from './CobeGlobe';
import EmailSignup from './EmailSignup';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Globe Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <CobeGlobe className="w-full h-full max-w-4xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/483a60b1-7682-4b57-847c-2628c6e6f3ed.png" 
            alt="Co-Evolve Network"
            className="w-40 h-40 mx-auto mb-6 object-contain"
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Global Platform for
          <br />
          <span className="text-primary">AI-Augmented Creators</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Connect creators worldwide through accountability partnerships, 
          pitch feedback, and verifiable outcomes in the AI creator economy.
        </p>

        {/* Email Signup */}
        <div className="mb-8">
          <EmailSignup />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={scrollToContact}
          >
            About Us
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => {
              const element = document.getElementById('mission');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Co-Create
          </Button>
        </div>

        {/* Simple Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">2</div>
            <div className="text-sm text-muted-foreground">Active Hubs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Barcelona</div>
            <div className="text-sm text-muted-foreground">Primary Hub</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Bangalore</div>
            <div className="text-sm text-muted-foreground">Partner Hub</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
