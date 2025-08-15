const Mission = () => {
  return (
    <section id="mission" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Bridging Human Creativity with AI Capabilities
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Co-Evolve Network connects creators worldwide through structured accountability, 
            real feedback, and verifiable outcomes. We're building the infrastructure for 
            the AI-augmented creator economy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-foreground">
              The Problem We Solve
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Creators struggle to find accountability partners for consistent progress
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Limited access to constructive feedback from experienced peers
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  No standardized way to verify and showcase real outcomes
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-foreground">
              Our Approach
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <strong>Accountability Partnerships:</strong> Match creators across time zones for weekly check-ins
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <strong>Community Feedback:</strong> Structured pitch sessions with experienced creators
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  <strong>Proof of Outcome:</strong> Document and verify real business results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;