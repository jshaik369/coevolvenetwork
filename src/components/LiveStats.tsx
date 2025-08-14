import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Brain, Rocket } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const LiveStats = () => {
  const { t } = useLanguage();
  const [memberCount, setMemberCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [aiProjects, setAiProjects] = useState(0);
  const [launches, setLaunches] = useState(0);

  useEffect(() => {
    // Animate counters on mount
    const animateCounter = (setter: (value: number) => void, target: number, duration: number) => {
      let current = 0;
      const increment = target / (duration / 50);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 50);
    };

    animateCounter(setMemberCount, 1247, 2000);
    animateCounter(setCityCount, 28, 1500);
    animateCounter(setAiProjects, 89, 2500);
    animateCounter(setLaunches, 15, 1800);
  }, []);

  const stats = [
    {
      icon: Users,
      value: memberCount.toLocaleString(),
      label: 'Global Members',
      color: 'text-primary'
    },
    {
      icon: Globe,
      value: cityCount,
      label: 'AI Hub Cities',
      color: 'text-blue-400'
    },
    {
      icon: Brain,
      value: aiProjects,
      label: 'AI Projects',
      color: 'text-purple-400'
    },
    {
      icon: Rocket,
      value: launches,
      label: 'Successful Launches',
      color: 'text-orange-400'
    }
  ];

  return (
    <section className="py-16 px-6 bg-black/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-code text-white mb-4">
            Live Network Statistics
          </h2>
          <p className="text-gray-400 font-mono">
            Real-time growth across the global Co-Evolve ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold font-code text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-mono">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Did You Know Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30 rounded-lg">
            <Brain className="w-5 h-5 text-primary mr-3" />
            <span className="text-gray-300 font-mono text-sm">
              <span className="text-primary font-semibold">Did you know?</span> 
              {' '}281+ AI startups launched in India this year, with Barcelona emerging as Europe's AI adoption hub
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveStats;