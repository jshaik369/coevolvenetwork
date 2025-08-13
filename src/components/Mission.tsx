import { motion } from 'framer-motion';

const Mission = () => {
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
            THE MISSION
          </h2>
          
          <div className="space-y-8 text-lg md:text-xl text-gray-300 font-mono leading-relaxed">
            <p>
              The future belongs to the sovereign individual who can partner with AI 
              to amplify their unique human experience into scalable impact.
            </p>
            
            <p>
              We build the infrastructure for this new world. We believe in proof over promises, 
              and our work is the evidence.
            </p>
            
            <p className="text-green-400 font-semibold">
              Innovation is better when documented. Tools that work for everyone. 
              Solid foundations matter.
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 p-8 border border-gray-800 rounded-lg bg-gray-900/50"
          >
            <h3 className="text-xl font-bold font-code text-green-400 mb-4">
              CORE PRINCIPLE
            </h3>
            <p className="text-gray-300 font-mono">
              The process of building is as valuable as the product itself. We believe in radical transparency. 
              Every venture we architect is professionally documented, creating a library of authentic 
              entrepreneurial journeys.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;