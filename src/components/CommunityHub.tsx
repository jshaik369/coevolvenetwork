import { motion } from 'framer-motion';
import { Users, Lightbulb, Code, BookOpen } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const CommunityHub = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Lightbulb,
      title: t('community.failure'),
      description: t('community.failureDesc'),
      color: 'text-red-400'
    },
    {
      icon: Users,
      title: t('community.adoption'),
      description: t('community.adoptionDesc'),
      color: 'text-blue-400'
    },
    {
      icon: Code,
      title: t('community.launch'),
      description: t('community.launchDesc'),
      color: 'text-green-400'
    }
  ];

  return (
    <section className="py-24 px-6 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6 tracking-wide">
            {t('community.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-mono max-w-3xl mx-auto">
            {t('community.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/50 p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
              <h3 className="text-xl font-bold font-code text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300 font-mono leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-black/50 p-8 rounded-lg border border-gray-700 max-w-2xl mx-auto">
            <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold font-code text-green-400 mb-2">
              Next Barcelona Session
            </h3>
            <p className="text-gray-300 font-mono mb-4">
              Weekly community meetup every Thursday, 7PM CET
            </p>
            <p className="text-sm text-gray-400 font-mono">
              📍 Community Flat, Barcelona • Open to all levels
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityHub;