import { motion } from 'framer-motion';
import { Download, FileText, Book, Layers, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

const Resources = () => {
  const { t } = useLanguage();

  const resources = [
    {
      icon: Book,
      title: t('resources.manifesto'),
      description: 'Our founding principles and vision for sovereign AI collaboration',
      filename: 'sovereign-manifesto.pdf',
      color: 'text-purple-400'
    },
    {
      icon: FileText,
      title: t('resources.guides'),
      description: 'Step-by-step guides for non-technical AI adoption',
      filename: 'ai-adoption-guides.zip',
      color: 'text-blue-400'
    },
    {
      icon: Layers,
      title: t('resources.templates'),
      description: 'Complete templates for launching your AI-powered venture',
      filename: 'launch-templates.zip',
      color: 'text-green-400'
    },
    {
      icon: AlertTriangle,
      title: t('resources.failures'),
      description: 'Real startup failure case studies and extracted lessons',
      filename: 'failure-case-studies.pdf',
      color: 'text-red-400'
    }
  ];

  const handleDownload = (filename: string, title: string) => {
    // Create mock content for demonstration
    const content = `# ${title}\n\nThis is a sample resource from Co-Evolve Network.\n\nFor the full version, please contact us at hello@coevolvenetwork.com\n\n## Community\nJoin our Barcelona community hub for weekly sessions!\n\n---\nCo-Evolve Network © 2024`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'resource_download', {
        event_category: 'engagement',
        event_label: filename,
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
          {resources.map((resource, index) => (
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
                <Button
                  onClick={() => handleDownload(resource.filename, resource.title)}
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-gray-600 text-white hover:bg-gray-700 font-mono"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <h3 className="text-xl font-bold font-code text-white mb-3">
                {resource.title}
              </h3>
              
              <p className="text-gray-300 font-mono leading-relaxed mb-4">
                {resource.description}
              </p>
              
              <div className="text-xs text-gray-500 font-mono">
                {resource.filename}
              </div>
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
              All resources are community-contributed and continuously updated
            </p>
            <p className="text-sm text-gray-400 font-mono">
              Have resources to contribute? Contact us to become a community contributor
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Resources;