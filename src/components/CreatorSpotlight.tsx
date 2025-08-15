import { motion } from 'framer-motion';
import { Heart, Brain, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreatorSpotlight = () => {
  const creators = [
    {
      name: 'Saranda',
      title: 'Co-founder, AyurFem',
      project: 'Ayurveda for Antenatal Care',
      status: 'CEN First Genesis Launch Documented',
      description: 'Bridging ancient Ayurvedic wisdom with modern maternal healthcare through AI-powered personalized care protocols.',
      outcome: 'Successfully launched MVP with documented proof-of-outcome protocol',
      icon: Heart,
      color: 'text-pink-400',
      bgGradient: 'from-pink-500/20 to-red-500/20',
      borderColor: 'border-pink-500/30'
    },
    {
      name: 'Carolina',
      title: 'Psychology Practitioner',
      project: 'Practitioner OS Automation',
      status: 'AI Workflow Integration in Progress',
      description: 'Automating traditional psychology practice workflows with AI, creating scalable mental health solutions.',
      outcome: 'Developing automated client intake and session planning systems',
      icon: Brain,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/30'
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-900/30 to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-6 tracking-wide">
            Sovereign Creator Spotlights
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-mono max-w-3xl mx-auto">
            Real members building the future of AI-augmented independence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {creators.map((creator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`bg-gradient-to-br ${creator.bgGradient} p-8 rounded-lg border ${creator.borderColor} hover:border-opacity-50 transition-all`}
            >
              <div className="flex items-start justify-between mb-6">
                <creator.icon className={`w-12 h-12 ${creator.color}`} />
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 bg-black/50 border border-gray-600 rounded-full">
                    <span className="text-xs font-mono text-green-400">ACTIVE</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold font-code text-white mb-2">
                {creator.name}
              </h3>
              
              <p className="text-primary font-mono text-sm mb-2">
                {creator.title}
              </p>

              <h4 className="text-lg font-semibold text-white mb-3">
                {creator.project}
              </h4>

              <p className="text-gray-300 font-mono mb-4 leading-relaxed">
                {creator.description}
              </p>

              <div className="bg-black/30 p-4 rounded-lg mb-6">
                <p className="text-sm font-mono text-gray-400 mb-2">Current Status:</p>
                <p className="text-white font-semibold">{creator.status}</p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg mb-6">
                <p className="text-sm font-mono text-gray-400 mb-2">Proof-of-Outcome:</p>
                <p className="text-green-400 font-mono text-sm">{creator.outcome}</p>
              </div>

              <Button
                variant="outline"
                className="w-full bg-black/50 border-gray-600 text-white hover:bg-gray-700 font-mono"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Case Study
              </Button>
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
            <h3 className="text-lg font-bold font-code text-green-400 mb-4">
              Join the Creator Economy
            </h3>
            <p className="text-gray-300 font-mono mb-6">
              Ready to build your sovereign creator journey? Connect with our Barcelona hub and start documenting your proof-of-outcome.
            </p>
            <Button
              variant="outline"
              className="bg-primary/20 border-primary/30 text-primary hover:bg-primary/30 font-mono"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorSpotlight;