import { Upload, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Your Data",
    description: "Connect your data sources or upload files in seconds. We support CSV, Excel, databases, and 20+ integrations.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI Analyzes Automatically",
    description: "Our advanced AI engine processes your data, identifying patterns, trends, anomalies, and relationships.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Get Actionable Insights",
    description: "Receive clear, prioritized insights in plain English with beautiful visualizations and recommendations.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            From Data to Insights in
            <span className="block text-secondary">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            No complex setup, no learning curve—just instant value from your data
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-secondary" />
              )}
              
              <div className="text-center space-y-4">
                <div className="relative inline-flex">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
