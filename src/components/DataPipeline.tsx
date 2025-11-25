import { Upload, Database, Cog, LineChart, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
const DataPipeline = () => {
  const stages = [{
    icon: Upload,
    title: "Data Import",
    description: "Upload files or connect databases",
    color: "from-blue-500 to-blue-600",
    features: ["Excel, CSV, JSON", "SQL Databases", "REST APIs"]
  }, {
    icon: Database,
    title: "Data Processing",
    description: "Clean, transform, and organize",
    color: "from-purple-500 to-purple-600",
    features: ["Auto-cleaning", "Schema detection", "Type inference"]
  }, {
    icon: Cog,
    title: "Analysis Engine",
    description: "DAX, statistics, and calculations",
    color: "from-orange-500 to-orange-600",
    features: ["DAX formulas", "Statistical tests", "Pivot tables"]
  }, {
    icon: LineChart,
    title: "Visualization",
    description: "Interactive charts and graphs",
    color: "from-green-500 to-green-600",
    features: ["15+ chart types", "Custom themes", "Real-time updates"]
  }, {
    icon: Sparkles,
    title: "AI Insights",
    description: "Automated recommendations",
    color: "from-pink-500 to-pink-600",
    features: ["Pattern detection", "Anomaly alerts", "Predictions"]
  }];
  return <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            From Data to Insights
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              In Minutes, Not Hours
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch your data flow through our intelligent pipeline, transforming raw information into actionable business intelligence.
          </p>
        </div>

        {/* Pipeline stages */}
        <div className="relative text-slate-950">
          {/* Desktop view - horizontal flow */}
          <div className="hidden lg:block">
            <div className="gap-4 mb-8 flex-row flex items-start justify-between">
              {stages.map((stage, index) => <div key={stage.title} className="flex-1 flex flex-col items-center text-slate-900">
                  {/* Stage card */}
                  <Card className="w-full p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card border-border group cursor-pointer animate-fade-in" style={{
                animationDelay: `${index * 100}ms`
              }}>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <stage.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{stage.title}</h3>
                        <p className="text-sm mb-3 text-slate-950">{stage.description}</p>
                        <div className="space-y-1">
                          {stage.features.map(feature => <div key={feature} className="text-xs flex items-center justify-center gap-1 border text-slate-950">
                              <div className="w-1 h-1 rounded-full bg-secondary" />
                              {feature}
                            </div>)}
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Animated connector arrow */}
                  {index < stages.length - 1 && <div className="absolute top-24 flex items-center" style={{
                left: `${(index + 1) * (100 / stages.length)}%`,
                transform: 'translateX(-50%)',
                width: `${100 / stages.length}%`
              }}>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/60 to-secondary/60 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{
                    animationDuration: '2s',
                    animationDelay: `${index * 200}ms`
                  }} />
                      </div>
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse ml-2" style={{
                  animationDelay: `${index * 200}ms`
                }} />
                    </div>}
                </div>)}
            </div>
          </div>

          {/* Mobile/Tablet view - vertical flow */}
          <div className="lg:hidden space-y-6">
            {stages.map((stage, index) => <div key={stage.title} className="relative">
                <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-card border-border animate-fade-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <stage.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{stage.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
                      <div className="space-y-1">
                        {stage.features.map(feature => <div key={feature} className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-secondary" />
                            {feature}
                          </div>)}
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Vertical connector */}
                {index < stages.length - 1 && <div className="flex justify-center py-2">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-primary/60 to-secondary/60 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" style={{
                  animationDuration: '2s',
                  animationDelay: `${index * 200}ms`
                }} />
                    </div>
                  </div>}
              </div>)}
          </div>
        </div>

        {/* Statistics row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-3xl font-bold text-primary mb-2">10x</div>
            <div className="text-sm text-muted-foreground">Faster Analysis</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-secondary/5 border border-secondary/10">
            <div className="text-3xl font-bold text-secondary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-3xl font-bold text-primary mb-2">1M+</div>
            <div className="text-sm text-muted-foreground">Rows Processed</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-secondary/5 border border-secondary/10">
            <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Automated</div>
          </div>
        </div>
      </div>
    </section>;
};
export default DataPipeline;