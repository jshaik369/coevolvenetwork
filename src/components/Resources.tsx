import { motion } from 'framer-motion';
import { Book, FileText, Layers, AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';

const Resources = () => {
  const { t } = useLanguage();

  const knowledgeBase = [
    {
      icon: Book,
      title: 'AI Adoption Insights',
      description: 'Real startup experiences and lessons from our community',
      actionType: 'blog',
      actionLabel: 'Read Articles',
      color: 'text-purple-400'
    },
    {
      icon: FileText,
      title: 'Community Guides',
      description: 'Practical guides written by experienced founders',
      actionType: 'coming-soon',
      actionLabel: 'Coming Soon',
      color: 'text-blue-400'
    },
    {
      icon: Layers,
      title: 'Startup Templates',
      description: 'Request access to our curated startup resources',
      actionType: 'contact',
      actionLabel: 'Request Access',
      color: 'text-green-400'
    },
    {
      icon: AlertTriangle,
      title: 'Failure Case Studies',
      description: 'Anonymous case studies from startup failures and pivots',
      actionType: 'contact',
      actionLabel: 'Request Access',
      color: 'text-red-400'
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
            {t('resources.title')}
          </h2>
          <p className="text-lg text-gray-300 font-mono max-w-3xl mx-auto">
            Open-source knowledge, templates, and insights from our community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {knowledgeBase.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-all hover:bg-gray-800/50"
            >
              <div className="flex items-start justify-between mb-4">
                <resource.icon className={`w-10 h-10 ${resource.color}`} />
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
              Community-driven knowledge base built by real founders
            </p>
            <p className="text-sm text-gray-400 font-mono">
              Have insights to share? <a href="mailto:hello@coevolvenetwork.com" className="text-primary hover:text-primary/80">Contact us</a> to contribute
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Resources;