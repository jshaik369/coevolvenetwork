import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import CobeGlobe from '@/components/CobeGlobe';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';

const Hero = () => {
  const { t } = useLanguage();
  
  const scrollToNext = () => {
    const nextSection = document.getElementById('mission');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative h-screen w-full bg-black overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>
      
      {/* Globe Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-3xl max-h-3xl">
          <CobeGlobe className="w-full h-full" />
        </div>
      </div>
      
      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-code text-white mb-6 tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-mono leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-green-400 transition-colors"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          whileHover={{ y: 5 }}
        >
          <ChevronDown className="w-8 h-8 animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
