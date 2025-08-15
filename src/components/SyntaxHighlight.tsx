import React from 'react';

interface SyntaxHighlightProps {
  children: React.ReactNode;
  className?: string;
}

const SyntaxHighlight = ({ children, className }: SyntaxHighlightProps) => {
  return (
    <div className={`font-mono text-sm leading-relaxed ${className || ''}`}>
      {children}
    </div>
  );
};

// Syntax highlighting components for different code elements
export const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-primary font-semibold">{children}</span>
);

export const Keyword = ({ children }: { children: React.ReactNode }) => (
  <span className="text-accent font-semibold">{children}</span>
);

export const String = ({ children }: { children: React.ReactNode }) => (
  <span className="text-orange-400 font-medium">{children}</span>
);

export const Comment = ({ children }: { children: React.ReactNode }) => (
  <span className="text-muted-foreground italic">{children}</span>
);

export const Variable = ({ children }: { children: React.ReactNode }) => (
  <span className="text-yellow-400 font-medium">{children}</span>
);

export const Function = ({ children }: { children: React.ReactNode }) => (
  <span className="text-blue-400 font-medium">{children}</span>
);

export const Property = ({ children }: { children: React.ReactNode }) => (
  <span className="text-cyan-400">{children}</span>
);

export default SyntaxHighlight;