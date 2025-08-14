import { motion } from 'framer-motion';
import { Mail, MapPin, Linkedin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Contact = () => {
  const { t } = useLanguage();
  
  return (
    <section id="contact" className="py-24 px-6 border-t border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-code text-white mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-gray-300 mb-12 font-mono">
            {t('contact.subtitle')}
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <motion.a
              href="mailto:hello@coevolvenetwork.com"
              className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-6 h-6" />
              <span>{t('contact.email')}</span>
            </motion.a>
            
            <motion.a
              href="https://www.linkedin.com/in/md-shaik-/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-6 h-6" />
              <span>{t('contact.linkedin')}</span>
            </motion.a>
            
            <motion.a
              href="#"
              className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MapPin className="w-6 h-6" />
              <span>{t('contact.barcelona')}</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;