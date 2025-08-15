import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailSignupProps {
  className?: string;
}

const EmailSignup = ({ className }: EmailSignupProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store email in Supabase
      const { error } = await supabase
        .from('email_signups')
        .insert([
          { 
            email: email.toLowerCase().trim(),
            source: 'hero_signup'
          }
        ]);

      if (error) {
        // Handle unique constraint violation (duplicate email)
        if (error.code === '23505') {
          toast({
            title: "Already Registered",
            description: "This email is already on our early access list!",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You have been added to our early access list. We will notify you when Co-Evolve Network launches!",
          variant: "default",
        });
      }

      setEmail('');

    } catch (error: any) {
      console.error('Email signup error:', error);
      toast({
        title: "Error",
        description: "Failed to sign up. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`w-full max-w-md mx-auto ${className || ''}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email for early access"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 text-base bg-card border-border focus:border-primary"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="lg"
          className="h-12 px-6 text-base font-semibold bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? 'Joining...' : 'Join Network'}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Get notified when we launch. No spam, unsubscribe anytime.
      </p>
    </motion.div>
  );
};

export default EmailSignup;