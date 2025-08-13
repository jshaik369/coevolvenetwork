import { motion } from 'framer-motion';
import { Mail, Phone, ExternalLink } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-32 px-6 bg-black border-t border-gray-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-code text-white mb-12 tracking-wide">
            CONNECT
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 font-mono mb-16 leading-relaxed">
            This is a call to arms for the builders, the creators, and the architects of the new world. 
            If this resonates, let's connect.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.a
              href="mailto:coevolvenetwork@gmail.com"
              className="flex flex-col items-center p-6 border border-gray-700 rounded-lg hover:border-green-400 transition-colors group"
              whileHover={{ y: -5 }}
            >
              <Mail className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-gray-300 group-hover:text-white">
                coevolvenetwork@gmail.com
              </span>
            </motion.a>
            
            <motion.a
              href="tel:+34678032254"
              className="flex flex-col items-center p-6 border border-gray-700 rounded-lg hover:border-green-400 transition-colors group"
              whileHover={{ y: -5 }}
            >
              <Phone className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-gray-300 group-hover:text-white">
                +34 678 032 254
              </span>
            </motion.a>
            
            <motion.a
              href="https://www.linkedin.com/in/jshaik369"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 border border-gray-700 rounded-lg hover:border-green-400 transition-colors group"
              whileHover={{ y: -5 }}
            >
              <ExternalLink className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-gray-300 group-hover:text-white">
                LinkedIn Profile
              </span>
            </motion.a>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 font-mono mb-4">
              We are always open to conversations with builders, innovators, and potential partners.
            </p>
            <div className="w-16 h-px bg-green-400 mx-auto"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;