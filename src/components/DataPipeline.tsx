import { Upload, Database, Cog, LineChart, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const DataPipeline = () => {
  const stages = [
    {
      icon: Upload,
      title: "Data Import",
      description: "Upload files or connect databases",
      features: ["Excel, CSV, JSON", "SQL Databases", "REST APIs"]
    },
    {
      icon: Database,
      title: "Data Processing",
      description: "Clean, transform, and organize",
      features: ["Auto-cleaning", "Schema detection", "Type inference"]
    },
    {
      icon: Cog,
      title: "Analysis Engine",
      description: "DAX, statistics, and calculations",
      features: ["DAX formulas", "Statistical tests", "Pivot tables"]
    },
    {
      icon: LineChart,
      title: "Visualization",
      description: "Interactive charts and graphs",
      features: ["15+ chart types", "Custom themes", "Real-time updates"]
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description: "Automated recommendations",
      features: ["Pattern detection", "Anomaly alerts", "Predictions"]
    }
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-card">
      <div className="container mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            From Data to Insights
            <span className="block text-gradient mt-2">In Minutes, Not Hours</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Watch your data flow through our intelligent pipeline, transforming raw information into actionable business intelligence.
          </p>
        </ScrollReveal>

        {/* Pipeline stages */}
        <div className="relative">
          {/* Desktop view - horizontal flow */}
          <div className="hidden lg:block">
            <StaggerContainer className="grid grid-cols-5 gap-6" staggerDelay={0.15}>
              {stages.map((stage, index) => (
                <StaggerItem key={stage.title}>
                  <div className="relative h-full">
                    <Card 
                      className="group h-full p-6 bg-background border-border hover:border-secondary/30 transition-all duration-500"
                    >
                      <div className="flex flex-col items-center text-center space-y-5">
                        <div className="w-14 h-14 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-all duration-300">
                          <stage.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{stage.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
                          <div className="space-y-2">
                            {stage.features.map((feature) => (
                              <div 
                                key={feature} 
                                className="text-xs text-muted-foreground/80 flex items-center justify-center gap-2"
                              >
                                <div className="w-1 h-1 rounded-full bg-secondary/60" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Connector line */}
                    {index < stages.length - 1 && (
                      <div className="absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-border to-secondary/30" />
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Mobile/Tablet view - vertical flow */}
          <div className="lg:hidden">
            <StaggerContainer className="space-y-4" staggerDelay={0.1}>
              {stages.map((stage, index) => (
                <StaggerItem key={stage.title}>
                  <div className="relative">
                    <Card className="p-6 bg-background border-border">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 flex items-center justify-center bg-primary/5 border border-primary/10 flex-shrink-0">
                          <stage.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{stage.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                          <div className="flex flex-wrap gap-3">
                            {stage.features.map((feature) => (
                              <span 
                                key={feature} 
                                className="text-xs text-muted-foreground/80 flex items-center gap-1"
                              >
                                <div className="w-1 h-1 rounded-full bg-secondary/60" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Vertical connector */}
                    {index < stages.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-px h-6 bg-gradient-to-b from-border to-secondary/30" />
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>

        {/* Statistics row */}
        <StaggerContainer className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
          {[
            { value: "10x", label: "Faster Analysis" },
            { value: "95%", label: "Accuracy Rate" },
            { value: "1M+", label: "Rows Processed" },
            { value: "24/7", label: "Automated" }
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center p-8 bg-background border border-border">
                <div className="text-3xl font-semibold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground tracking-wide">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default DataPipeline;
