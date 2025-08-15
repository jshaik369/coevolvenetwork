import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';

const ProofOfOutcome = () => {
  const outcomes = [
    {
      creator: 'Saranda (AyurFem)',
      metric: '8 weeks',
      achievement: 'Idea to Live Product Launch',
      details: 'MVP development, user testing, and marketplace launch with documented proof-of-outcome protocol',
      progress: 100,
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      creator: 'Carolina (Psychology OS)',
      metric: '40% efficiency',
      achievement: 'Practice Workflow Automation',
      details: 'Automated client intake, session planning, and follow-up systems currently in testing phase',
      progress: 75,
      icon: TrendingUp,
      color: 'text-blue-400'
    }
  ];

  const metrics = [
    {
      label: 'Documented Launches',
      value: '2',
      description: 'Real products in market',
      icon: Target
    },
    {
      label: 'Avg. Time to MVP',
      value: '6-8 weeks',
      description: 'From idea to launch',
      icon: Clock
    },
    {
      label: 'Success Rate',
      value: '100%',
      description: 'Members reaching MVP',
      icon: CheckCircle
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6 tracking-wide">
            Proof-of-Outcome Protocol
          </h2>
          <p className="text-lg text-gray-300 font-mono max-w-3xl mx-auto">
            Measurable results from real sovereign creators in our network
          </p>
        </motion.div>

        {/* Individual Outcomes */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {outcomes.map((outcome, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-black/50 p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <outcome.icon className={`w-10 h-10 ${outcome.color}`} />
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold font-code text-white">
                    {outcome.metric}
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    {outcome.creator}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold font-code text-white mb-3">
                {outcome.achievement}
              </h3>

              <p className="text-gray-300 font-mono mb-6 leading-relaxed">
                {outcome.details}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-mono text-gray-400">Progress</span>
                  <span className="text-sm font-mono text-white">{outcome.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${outcome.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                    className={`h-2 rounded-full ${outcome.progress === 100 ? 'bg-green-400' : 'bg-blue-400'}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Network Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-b from-gray-800/50 to-black/50 rounded-lg border border-gray-700"
            >
              <metric.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold font-code text-white mb-2">
                {metric.value}
              </div>
              <div className="text-lg font-mono text-gray-300 mb-2">
                {metric.label}
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {metric.description}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-8 rounded-lg border border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold font-code text-primary mb-4">
              Ready to Document Your Journey?
            </h3>
            <p className="text-gray-300 font-mono">
              Join Saranda and Carolina in building measurable, sovereign creator outcomes through our proof-of-outcome protocol.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProofOfOutcome;