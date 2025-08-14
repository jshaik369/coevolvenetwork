import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

const EmailSignup = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    try {
      // Google Sheets integration endpoint
      const response = await fetch('https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          source: 'coevolvenetwork.com'
        }),
      });
      
      toast({
        title: "Welcome to the Network",
        description: "You've successfully joined the Co-Evolve community. Prepare for the evolution.",
      });
      
      setEmail('');
      
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'email_signup', {
          event_category: 'engagement',
          event_label: 'newsletter_signup'
        });
      }
      
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to join the network. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section 
      className="py-24 px-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-code mb-6 text-green-400">
          {t('signup.title')}
        </h2>
        <p className="text-lg text-gray-300 mb-8 font-mono">
          {t('signup.subtitle')}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={t('signup.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 font-mono focus:border-green-400"
            required
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-green-400 hover:bg-green-300 text-black font-mono font-bold px-8"
          >
            {loading ? 'CONNECTING...' : t('signup.button')}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-4 font-mono">
          {t('signup.disclaimer')}
        </p>
      </div>
    </motion.section>
  );
};

export default EmailSignup;