import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypingAnimationProps {
  className?: string;
}

const aiExpertPhrases = [
  "Neural networks evolving at frontier scale...",
  "Multimodal transformers optimizing human-AI alignment...",
  "Constitutional AI through collaborative research...",
  "Edge computing deployment with distributed inference...", 
  "Reinforcement learning from human feedback...",
  "Vector databases scaling semantic search...",
  "Retrieval-augmented generation pipelines...",
  "Few-shot learning acceleration protocols...",
  "Model quantization for edge deployment...",
  "Prompt engineering optimization frameworks...",
  "Neural architecture search automation...",
  "Gradient descent convergence analysis...",
  "Attention mechanisms breakthrough research...",
  "Embedding spaces dimensional reduction...",
  "MLOps continuous integration systems...",
  "Transformer architecture scaling laws...",
  "Self-supervised learning paradigms...",
  "Causal inference in neural networks...",
  "Federated learning privacy protocols...",
  "Graph neural networks advancement...",
  "Computer vision foundation models...",
  "Natural language understanding systems...",
  "Generative AI safety alignment...",
  "Autonomous agents cognitive architecture...",
  "Neural symbolic reasoning integration...",
  "Continual learning plasticity research...",
  "Meta-learning optimization strategies...",
  "Adversarial robustness enhancement...",
  "Interpretable AI explainability methods...",
  "Ethical AI governance frameworks...",
  "Human-computer interaction evolution...",
  "Cognitive load optimization studies...",
  "Collaborative intelligence augmentation...",
  "AI democratization initiatives scaling...",
  "Cross-cultural AI adoption patterns...",
  "Startup ecosystem acceleration protocols...",
  "Innovation pipeline optimization systems...",
  "Community-driven development methodologies...",
  "Open-source intelligence collaboration...",
  "Global knowledge transfer mechanisms...",
  "Bharat-Barcelona innovation corridor...",
  "Indo-Catalan tech collaboration nexus...",
  "Distributed mentorship network protocols...",
  "Peer-to-peer learning amplification...",
  "Cultural bridge technology transfer...",
  "Multilingual AI development frameworks...",
  "Regional expertise synthesis models...",
  "Cross-border innovation catalysts...",
  "Sovereign creator empowerment systems...",
  "AI-augmented entrepreneurship platforms..."
];

const TypingAnimation = ({ className }: TypingAnimationProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentPhrase = aiExpertPhrases[currentPhraseIndex];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentPhrase.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, Math.random() * 100 + 50); // Variable typing speed for realism
      } else {
        // Finished typing, pause before deleting
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000 + Math.random() * 1000); // Smart pause timing
      }
    } else {
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30); // Faster deletion
      } else {
        // Move to next phrase
        setCurrentPhraseIndex((prev) => (prev + 1) % aiExpertPhrases.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isTyping, currentPhraseIndex]);

  // Cursor blinking
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div
      className={`font-mono text-sm md:text-base ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-primary">{'>'}</span>
      <span className="ml-2 text-gray-300">
        {displayText}
        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          _
        </span>
      </span>
    </motion.div>
  );
};

export default TypingAnimation;