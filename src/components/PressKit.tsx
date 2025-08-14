import { motion } from 'framer-motion';
import { Download, FileText, Image, Users, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const PressKit = () => {
  const { t } = useLanguage();

  const pressAssets = [
    {
      icon: FileText,
      title: 'Launch Slide Deck',
      description: '6-slide presentation covering mission, strategy & ecosystem',
      format: 'PDF • 2.3 MB',
      download: '/press/co-evolve-launch-deck.pdf'
    },
    {
      icon: FileText,
      title: 'Manifesto Document',
      description: 'Complete vision for human-AI collaborative independence',
      format: 'PDF • 850 KB',
      download: '/press/co-evolve-manifesto.pdf'
    },
    {
      icon: Image,
      title: 'Brand Assets',
      description: 'Logos, globe graphics, and visual identity elements',
      format: 'ZIP • 4.2 MB',
      download: '/press/co-evolve-brand-assets.zip'
    },
    {
      icon: Users,
      title: 'Founder Bios & Photos',
      description: 'High-resolution photos and detailed biographies',
      format: 'ZIP • 12 MB',
      download: '/press/founder-assets.zip'
    },
    {
      icon: Globe,
      title: 'Global Network Data',
      description: 'Statistics, member demographics, and growth metrics',
      format: 'PDF • 1.1 MB',
      download: '/press/network-statistics.pdf'
    }
  ];

  const mediaContacts = [
    {
      name: 'Global Media Relations',
      email: 'press@coevolvenetwork.org',
      role: 'General inquiries & interviews'
    },
    {
      name: 'Barcelona Hub',
      email: 'barcelona@coevolvenetwork.org',
      role: 'Local events & partnerships'
    },
    {
      name: 'India Operations',
      email: 'india@coevolvenetwork.org',
      role: 'Bangalore hub & regional growth'
    }
  ];

  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6">
            Press Kit & Media Assets
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-mono leading-relaxed">
            Everything you need to cover the Co-Evolve Network launch story. 
            High-quality assets, data, and direct media contacts.
          </p>
        </motion.div>

        {/* Press Assets */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {pressAssets.map((asset, index) => {
            const Icon = asset.icon;
            return (
              <motion.div
                key={asset.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold font-code text-white mb-2">
                      {asset.title}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm mb-3 leading-relaxed">
                      {asset.description}
                    </p>
                    <div className="text-xs text-gray-500 font-mono mb-4">
                      {asset.format}
                    </div>
                    <button 
                      className="inline-flex items-center px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors"
                      onClick={() => {
                        // In a real implementation, this would trigger the download
                        console.log(`Downloading: ${asset.download}`);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Media Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gray-900/30 border border-gray-800 rounded-lg p-8"
        >
          <h3 className="text-2xl font-bold font-code text-white mb-6 text-center">
            Media Contacts
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {mediaContacts.map((contact, index) => (
              <motion.div
                key={contact.email}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-4 bg-gray-800/50 rounded-lg"
              >
                <h4 className="text-white font-semibold font-code mb-2">
                  {contact.name}
                </h4>
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-primary font-mono text-sm hover:text-primary/80 transition-colors"
                >
                  {contact.email}
                </a>
                <p className="text-gray-400 text-xs font-mono mt-2">
                  {contact.role}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg">
            <h4 className="text-white font-bold font-code mb-4">Quick Facts</h4>
            <div className="text-sm text-gray-300 font-mono space-y-2">
              <div>🌍 <span className="text-primary">28 AI hub cities</span> across 6 continents</div>
              <div>🚀 <span className="text-primary">August 15, 2025</span> Independence Day launch</div>
              <div>🤝 <span className="text-primary">Indo-Catalan</span> collaboration focus</div>
              <div>💡 <span className="text-primary">281+ Indian</span> AI startups launched this year</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PressKit;