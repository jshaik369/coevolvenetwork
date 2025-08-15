import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

const Mission = () => {
  const { t } = useLanguage();
  
  return (
    <section id="mission" className="py-32 px-6 bg-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-12 tracking-wide">
            {t('mission.title')}
          </h2>
          
          <div className="space-y-8 text-lg md:text-xl text-gray-300 font-mono leading-relaxed">
            <p>
              <span className="text-primary font-semibold">Bharat → Barcelona → World:</span> We're building a global AI adoption movement that transcends borders, connecting sovereign creators from India's tech hubs to Catalonia's innovation centers and beyond.
            </p>
            
            <p>
              {t('mission.text1')}
            </p>
            
            <p>
              Our mission combines the entrepreneurial spirit of Indian independence with Catalonia's history of autonomous innovation, creating a blueprint for AI-augmented sovereignty that respects cultural diversity while fostering global collaboration.
            </p>

            {/* Creator Testimonials */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-800">
                <p className="text-gray-300 font-mono text-sm mb-4 italic">
                  "The Co-Evolve Network provided the perfect foundation to transform ancient Ayurvedic knowledge into modern AI-powered maternal care. From idea to live product in 8 weeks."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <span className="text-pink-400 font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Saranda</p>
                    <p className="text-gray-400 text-xs font-mono">Co-founder, AyurFem</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-800">
                <p className="text-gray-300 font-mono text-sm mb-4 italic">
                  "Automating my psychology practice workflows felt impossible until I found this community. Now I'm building tools that will scale mental healthcare accessibility."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">C</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Carolina</p>
                    <p className="text-gray-400 text-xs font-mono">Psychology Practitioner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 p-8 border border-gray-800 rounded-lg bg-gray-900/50"
          >
            <h3 className="text-xl font-bold font-code text-green-400 mb-4">
              {t('mission.core')}
            </h3>
            <p className="text-gray-300 font-mono">
              {t('mission.coreText')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;