import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import CobeGlobe from '@/components/CobeGlobe';

const Hero = () => {
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
      {/* Globe Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-2xl max-h-2xl">
          <CobeGlobe className="w-full h-full" />
        </div>
      </div>
      
      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-code text-white mb-6 tracking-tight">
            CO-EVOLVE NETWORK
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-mono leading-relaxed">
            Architecting the new era of Sovereign Independence. We are a foundry for the tools, 
            ventures, and community that will power the next generation of AI-augmented creators.
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
