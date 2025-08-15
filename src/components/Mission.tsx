import React from 'react';
import { motion } from 'framer-motion';
import CodeStyleContent from './CodeStyleContent';

const Mission = () => {
  return (
    <section id="mission" className="section-container bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            &lt;our_mission /&gt;
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
            <span className="text-accent">// </span>Building the infrastructure for AI-augmented creator collaboration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <CodeStyleContent />
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;