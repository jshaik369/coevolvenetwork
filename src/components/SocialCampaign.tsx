import { motion } from 'framer-motion';
import { Twitter, Linkedin, Instagram, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const SocialCampaign = () => {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const socialPosts = [
    {
      platform: 'Twitter/X',
      icon: Twitter,
      copy: `🚀 August 15: Co-Evolve Network launches!

From Bharat to Barcelona, we're building the future of human-AI collaboration.

🌍 28 AI hub cities connected
🤝 Indo-Catalan innovation bridge
💡 Weekly angel rounds in Barcelona
🧠 Constitutional AI alignment research

Join the sovereign creator movement 👇
coevolvenetwork.org

#AI #IndependenceDay #Innovation #Barcelona #India #CoEvolve`,
      handle: '@coevolvenetwork'
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      copy: `🇮🇳 August 15, 2025: Independence Day Launch 🇪🇸

Co-Evolve Network is bridging Indian innovation with Catalan creativity to architect sovereign independence through AI collaboration.

🎯 What we're building:
• Weekly angel investor rounds in Barcelona
• Cross-cultural AI adoption workshops
• Failure labs turning startup insights into community wisdom
• Real-time mentorship for AI-augmented creators

🌍 Our global network spans 28 AI hub cities, from Bangalore to Barcelona, Toronto to Tel Aviv, connecting diverse creators who believe in human-AI partnership over replacement.

The future belongs to sovereign creators who partner with AI to amplify their unique human experience into scalable impact.

Ready to co-evolve? Join us: coevolvenetwork.org

#ArtificialIntelligence #Innovation #Entrepreneurship #Barcelona #India #StartupEcosystem #AI #TechCommunity`,
      handle: 'Co-Evolve Network'
    },
    {
      platform: 'Instagram',
      icon: Instagram,
      copy: `🌍✨ AUGUST 15 LAUNCH ✨🌍

Co-Evolve Network: Where Bharat meets Barcelona 🇮🇳🇪🇸

Building the future of human-AI collaboration, one creator at a time.

🚀 Weekly pitch sessions
🧠 AI adoption workshops  
💡 Cross-cultural innovation
🤝 Global community of 1200+ creators

From constitutional AI research to startup failure labs, we're transforming insights into action.

Join the movement 👆 Link in bio

#CoEvolve #AI #Innovation #Barcelona #India #TechCommunity #CreatorEconomy #IndependenceDay #FutureOfWork`,
      handle: '@coevolvenetwork'
    }
  ];

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied to clipboard!",
        description: "Social media post copied successfully.",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the text manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-6">
            <Share2 className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-400 font-mono text-sm">Launch Campaign</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6">
            Spread the Word
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-mono leading-relaxed">
            Help us launch the global AI collaboration movement. Ready-to-share content for all major platforms.
          </p>
        </motion.div>

        <div className="space-y-8">
          {socialPosts.map((post, index) => {
            const Icon = post.icon;
            return (
              <motion.div
                key={post.platform}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold font-code">
                        {post.platform}
                      </h3>
                      <p className="text-gray-400 text-sm font-mono">
                        {post.handle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(post.copy, index)}
                    className="flex items-center px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {post.copy}
                  </pre>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg">
            <h4 className="text-white font-bold font-code mb-4">Join the Movement</h4>
            <p className="text-sm text-gray-300 font-mono mb-4">
              Share your story, tag us, and help build the future of human-AI collaboration
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://x.com/coevolvenetwork" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                @coevolvenetwork
              </a>
              <a 
                href="https://www.linkedin.com/in/coevolvenetwork" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                LinkedIn
              </a>
              <a 
                href="https://www.instagram.com/coevolvenetwork/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialCampaign;