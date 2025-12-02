import { Card } from "@/components/ui/card";
import { Brain, Database, BarChart3, Zap, Users, Shield } from "lucide-react";
import featureAi from "@/assets/feature-ai.jpg";
import featureSources from "@/assets/feature-sources.jpg";
import featureDashboard from "@/assets/feature-dashboard.jpg";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms automatically detect patterns, anomalies, and trends in your data.",
    image: featureAi
  },
  {
    icon: Database,
    title: "Universal Data Connectors",
    description: "Connect to CSV, Google Sheets, SQL databases, Google Analytics, Shopify, Stripe, and more—all in one place.",
    image: featureSources
  },
  {
    icon: BarChart3,
    title: "Instant Visualizations",
    description: "Beautiful, interactive dashboards generated automatically with charts, graphs, and insights that matter.",
    image: featureDashboard
  },
  {
    icon: Zap,
    title: "Real-Time Insights",
    description: "Get notified instantly when significant changes or opportunities are detected in your data."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share insights, dashboards, and reports with your team. Comment, discuss, and make data-driven decisions together."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, SOC2 compliance, and GDPR-ready data handling to keep your information safe."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-secondary mb-4 block">
            Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Everything You Need for
            <span className="block text-gradient mt-2">Data Excellence</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Comprehensive tools designed for professionals who demand precision and elegance in their analytics workflow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group p-8 bg-background border-border hover:border-secondary/30 transition-all duration-500 hover:shadow-[var(--shadow-card)]"
            >
              <div className="space-y-6">
                {feature.image && (
                  <div className="aspect-video overflow-hidden mb-6 -mx-8 -mt-8">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  </div>
                )}
                <div className="w-12 h-12 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
