import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Lightbulb, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const BarcelonaHub = () => {
  const { t } = useLanguage();

  const hubFeatures = [
    {
      icon: TrendingUp,
      title: 'Weekly Angel Rounds',
      description: 'Live pitch sessions with Barcelona angel investors every Thursday',
      color: 'text-green-400'
    },
    {
      icon: Lightbulb,
      title: 'Failure Insights Labs',
      description: 'Learn from startup failures with post-mortem analysis sessions',
      color: 'text-orange-400'
    },
    {
      icon: Users,
      title: 'Cross-Industry AI Adoption',
      description: 'Non-tech founders exploring AI integration in traditional sectors',
      color: 'text-blue-400'
    },
    {
      icon: Clock,
      title: 'Real-Time Feedback',
      description: 'Instant pitch feedback from experienced entrepreneurs',
      color: 'text-purple-400'
    }
  ];

  const upcomingEvents = [
    {
      date: 'Aug 22',
      title: 'AI Adoption Workshop',
      location: 'Open Terrace • Open to all levels',
      time: '18:00 CET'
    },
    {
      date: 'Aug 29',
      title: 'Angel Investor Pitch Night',
      location: 'Open Terrace • Open to all levels',
      time: '19:30 CET'
    },
    {
      date: 'Sep 5',
      title: 'Indo-Catalan Collaboration Meetup',
      location: 'Open Terrace • Open to all levels',
      time: '17:00 CET'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full mb-6">
            <MapPin className="w-4 h-4 text-orange-400 mr-2" />
            <span className="text-orange-400 font-mono text-sm">Barcelona Innovation Hub</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6">
            Bharat → Barcelona Bridge
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-mono leading-relaxed">
            Where Indian innovation meets Catalan creativity. Weekly angel rounds, failure labs, 
            and cross-cultural AI adoption workshops in the heart of Europe's tech ecosystem.
          </p>
        </motion.div>

        {/* Hub Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {hubFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-code text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gray-900/30 border border-gray-800 rounded-lg p-8"
        >
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-2xl font-bold font-code text-white">
              Upcoming Barcelona Events
            </h3>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-primary font-bold font-mono text-lg">
                      {event.date}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-code">
                      {event.title}
                    </h4>
                    <p className="text-gray-400 text-sm font-mono">
                      {event.location} • {event.time}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors">
                  Join
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BarcelonaHub;