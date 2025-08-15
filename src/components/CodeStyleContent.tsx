import React from 'react';
import SyntaxHighlight, { Tag, Keyword, String, Comment, Variable, Function, Property } from './SyntaxHighlight';

const CodeStyleContent = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-card rounded-lg border border-border">
      <SyntaxHighlight className="space-y-6">
        <div className="mb-8">
          <Tag>&lt;co-evolve-network&gt;</Tag>
          <div className="ml-4 mt-2">
            <Property>mission</Property><span className="text-foreground">=</span><String>"Building the future of AI-augmented creator collaboration"</String>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            <Tag>Co-Evolve Network</Tag> is an <Keyword>artificial intelligence</Keyword> research and <Keyword>creator platform</Keyword>. 
            We're building a future where every creator has access to the <Variable>accountability partnerships</Variable>, 
            <Variable>AI tools</Variable>, and <Variable>verifiable outcomes</Variable> needed to thrive in the creator economy.
          </p>

          <p className="text-foreground leading-relaxed">
            While <Keyword>AI capabilities</Keyword> have advanced dramatically, key gaps remain in <Function>creator collaboration</Function>. 
            Knowledge of how to effectively use AI for <Property>content creation</Property>, <Property>audience building</Property>, 
            and <Property>monetization</Property> is concentrated within top creators, limiting both the public discourse on 
            AI-powered creativity and people's abilities to build sustainable creator businesses.
          </p>

          <p className="text-foreground leading-relaxed">
            We are <Variable>scientists</Variable>, <Variable>engineers</Variable>, <Variable>creators</Variable>, and <Variable>builders</Variable> who have 
            created widely-used AI products and built successful creator businesses across platforms.
          </p>
        </div>

        <div className="mt-8">
          <Tag>&lt;principles&gt;</Tag>
          <div className="ml-4 mt-4 space-y-6">
            
            <div>
              <Function>collaboration_over_competition</Function><span className="text-foreground">() {"{"}</span>
              <div className="ml-4 mt-2">
                <Comment>// Creator success is better when shared</Comment>
                <p className="text-foreground mt-2">
                  We believe that we'll most effectively advance the <Keyword>creator economy</Keyword> by fostering 
                  <Variable>accountability partnerships</Variable> and <Property>knowledge sharing</Property>. 
                  We plan to frequently publish <String>"case studies"</String>, <String>"success frameworks"</String>, 
                  and <String>collaboration tools</String>.
                </p>
              </div>
              <span className="text-foreground">{"}"}</span>
            </div>

            <div>
              <Function>ai_that_augments_creators</Function><span className="text-foreground">() {"{"}</span>
              <div className="ml-4 mt-2">
                <Comment>// Emphasis on human-AI collaboration</Comment>
                <p className="text-foreground mt-2">
                  Instead of replacing creators, we're building <Keyword>multimodal AI systems</Keyword> that work with 
                  creators collaboratively. More <Property>flexible</Property>, <Property>adaptable</Property>, 
                  and <Property>personalized AI tools</Property> that can adapt to every creator's unique style and audience.
                </p>
              </div>
              <span className="text-foreground">{"}"}</span>
            </div>

            <div>
              <Function>verifiable_outcomes</Function><span className="text-foreground">() {"{"}</span>
              <div className="ml-4 mt-2">
                <Comment>// Solid foundations matter</Comment>
                <p className="text-foreground mt-2">
                  <Property>Creator intelligence</Property> as the cornerstone. We're building systems that track 
                  <Variable>real growth metrics</Variable>, <Variable>audience engagement</Variable>, and 
                  <Variable>revenue outcomes</Variable>. <Keyword>Advanced analytics</Keyword> and 
                  <Keyword>blockchain verification</Keyword> ensure transparent, trustworthy progress tracking.
                </p>
              </div>
              <span className="text-foreground">{"}"}</span>
            </div>

            <div>
              <Function>learning_by_creating</Function><span className="text-foreground">() {"{"}</span>
              <div className="ml-4 mt-2">
                <Comment>// Research and creator co-design</Comment>
                <p className="text-foreground mt-2">
                  <Property>Products</Property> enable iterative learning through deployment. We focus on understanding 
                  how our <Variable>accountability systems</Variable> create genuine value. The most important breakthroughs 
                  come from rethinking our <Function>collaboration objectives</Function>, not just optimizing existing metrics.
                </p>
              </div>
              <span className="text-foreground">{"}"}</span>
            </div>
          </div>
          <Tag>&lt;/principles&gt;</Tag>
        </div>

        <div className="mt-8">
          <Tag>&lt;join-network&gt;</Tag>
          <div className="ml-4 mt-4">
            <Property>locations</Property><span className="text-foreground">=</span><String>["Barcelona", "Bangalore", "Global"]</String>
            <br />
            <Property>status</Property><span className="text-foreground">=</span><String>"Building transformative creator economy"</String>
            <br />
            <Property>seeking</Property><span className="text-foreground">=</span><String>"AI-augmented creators ready to co-evolve"</String>

            <div className="mt-4 space-y-3">
              <p className="text-foreground">
                We're building <Keyword>AI systems</Keyword> that push <Property>technical boundaries</Property> while 
                delivering real value to creators worldwide. Our network combines <Variable>rigorous accountability</Variable> 
                with <Variable>creative exploration</Variable>.
              </p>

              <div className="space-y-2">
                <div><Keyword>Creator Partners</Keyword><span className="text-foreground">:</span> <String>"Join accountability partnerships with verified outcomes"</String></div>
                <div><Keyword>AI Researchers</Keyword><span className="text-foreground">:</span> <String>"Build creator-focused AI tools and platforms"</String></div>
                <div><Keyword>Community Builders</Keyword><span className="text-foreground">:</span> <String>"Foster global creator collaboration networks"</String></div>
                <div><Keyword>Platform Engineers</Keyword><span className="text-foreground">:</span> <String>"Scale infrastructure for millions of creator partnerships"</String></div>
              </div>
            </div>
          </div>
          <Tag>&lt;/join-network&gt;</Tag>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <Comment>© 2025 Co-Evolve Network. Building the future of AI-augmented creator collaboration.</Comment>
        </div>
      </SyntaxHighlight>
    </div>
  );
};

export default CodeStyleContent;