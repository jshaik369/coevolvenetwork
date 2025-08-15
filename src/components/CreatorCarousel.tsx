import { motion } from 'framer-motion';
import { Heart, Brain, ArrowRight } from 'lucide-react';

const CreatorCarousel = () => {
  const featuredCreators = [
    {
      name: 'Saranda',
      title: 'AyurFem Co-founder',
      tagline: 'Ancient Wisdom → Modern AI',
      status: 'Live Product',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
    {
      name: 'Carolina',
      title: 'Psychology Practitioner',
      tagline: 'Traditional Practice → AI Automation', 
      status: 'In Development',
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="mt-12"
    >
      <div className="text-center mb-8">
        <h3 className="text-lg font-mono text-primary mb-2">
          Featured Sovereign Creators
        </h3>
        <p className="text-sm text-gray-400 font-mono">
          Real members, real outcomes, real proof-of-concept
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
        {featuredCreators.map((creator, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
            className={`flex-1 p-6 ${creator.bgColor} border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-4">
              <creator.icon className={`w-8 h-8 ${creator.color}`} />
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${creator.status === 'Live Product' ? 'bg-green-400' : 'bg-yellow-400'} rounded-full`} />
                <span className="text-xs font-mono text-gray-400">{creator.status}</span>
              </div>
            </div>

            <h4 className="text-lg font-bold font-code text-white mb-1">
              {creator.name}
            </h4>
            
            <p className="text-sm text-gray-400 font-mono mb-3">
              {creator.title}
            </p>

            <p className="text-sm font-mono text-gray-300 mb-4">
              {creator.tagline}
            </p>

            <div className="flex items-center text-xs font-mono text-primary hover:text-primary/80 transition-colors">
              <span>View Journey</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CreatorCarousel;