import { motion } from 'framer-motion';
import { Book, FileText, Layers, AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';

const Resources = () => {
  const { t } = useLanguage();

  const creatorToolkit = [
    {
      icon: Book,
      title: 'AyurFem Launch Documentation',
      description: 'Complete case study of Saranda\'s 8-week journey from ancient Ayurveda to AI-powered maternal care',
      actionType: 'blog',
      actionLabel: 'Read Case Study',
      color: 'text-pink-400',
      creator: 'Saranda'
    },
    {
      icon: FileText,
      title: 'Psychology Practice Automation Guide',
      description: 'Carolina\'s blueprint for automating traditional psychology workflows with AI systems',
      actionType: 'contact',
      actionLabel: 'Request Access',
      color: 'text-blue-400',
      creator: 'Carolina'
    },
    {
      icon: Layers,
      title: 'Proof-of-Outcome Templates',
      description: 'Reusable frameworks for documenting and measuring sovereign creator outcomes',
      actionType: 'contact',
      actionLabel: 'Request Access',
      color: 'text-green-400',
      creator: 'Network'
    },
    {
      icon: AlertTriangle,
      title: 'Creator Journey Pivots',
      description: 'Real pivot stories and failure documentation from our sovereign creator community',
      actionType: 'contact',
      actionLabel: 'Request Access',
      color: 'text-red-400',
      creator: 'Community'
    }
  ];

  const handleAction = (actionType: string, title: string) => {
    if (actionType === 'contact') {
      window.location.href = 'mailto:hello@coevolvenetwork.com?subject=Resource Request: ' + title;
    }
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'resource_request', {
        event_category: 'engagement',
        event_label: title,
        value: 1
      });
    }
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6 tracking-wide">
            Creator Success Toolkit
          </h2>
          <p className="text-lg text-gray-300 font-mono max-w-3xl mx-auto">
            Real resources and case studies from Saranda, Carolina, and our sovereign creator network
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {creatorToolkit.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-all hover:bg-gray-800/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <resource.icon className={`w-10 h-10 ${resource.color}`} />
                  <div className="text-xs font-mono text-gray-400">
                    by {resource.creator}
                  </div>
                </div>
                {resource.actionType === 'blog' ? (
                  <Link to="/blog">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/50 border-gray-600 text-white hover:bg-gray-700 font-mono"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {resource.actionLabel}
                    </Button>
                  </Link>
                ) : resource.actionType === 'contact' ? (
                  <Button
                    onClick={() => handleAction(resource.actionType, resource.title)}
                    variant="outline"
                    size="sm"
                    className="bg-black/50 border-gray-600 text-white hover:bg-gray-700 font-mono"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {resource.actionLabel}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="bg-gray-700/50 border-gray-600 text-gray-400 font-mono cursor-not-allowed"
                  >
                    {resource.actionLabel}
                  </Button>
                )}
              </div>
              
              <h3 className="text-xl font-bold font-code text-white mb-3">
                {resource.title}
              </h3>
              
              <p className="text-gray-300 font-mono leading-relaxed">
                {resource.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-black/50 p-6 rounded-lg border border-gray-700 max-w-2xl mx-auto">
            <p className="text-gray-300 font-mono mb-4">
              Creator Success Toolkit built by Saranda, Carolina, and our sovereign creator community
            </p>
            <p className="text-sm text-gray-400 font-mono">
              Ready to document your journey? <a href="mailto:hello@coevolvenetwork.com" className="text-primary hover:text-primary/80">Join the network</a> and start building
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Resources;