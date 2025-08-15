import { Mail, MapPin, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-muted/50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Connect with Co-Evolve Network
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Ready to join the global creator community? Get in touch to learn about 
          accountability partnerships and collaboration opportunities.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button asChild size="lg">
            <a href="mailto:coevolvenetwork@gmail.com">
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </a>
          </Button>
          
          <Button variant="outline" asChild size="lg">
            <a 
              href="https://www.linkedin.com/in/coevolvenetwork/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5 mr-2" />
              Connect on LinkedIn
            </a>
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <a 
            href="https://www.instagram.com/coevolvenetwork/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Instagram
          </a>
          <a 
            href="https://x.com/coevolvenetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            X (Twitter)
          </a>
          <a 
            href="https://wa.me/34678032254"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            WhatsApp
          </a>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <MapPin className="w-5 h-5" />
          <span>Barcelona, Spain • Bangalore, India</span>
        </div>
      </div>
    </section>
  );
};

export default Contact;