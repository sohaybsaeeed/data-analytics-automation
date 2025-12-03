import { Card } from "@/components/ui/card";
import { Brain, Database, BarChart3, Zap, Users, Shield } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import featureAi from "@/assets/feature-ai.jpg";
import featureSources from "@/assets/feature-sources.jpg";
import featureDashboard from "@/assets/feature-dashboard.jpg";

const features = [{
  icon: Brain,
  title: "AI-Powered Analysis",
  description: "Advanced machine learning algorithms automatically detect patterns, anomalies, and trends in your data.",
  image: featureAi
}, {
  icon: Database,
  title: "Universal Data Connectors",
  description: "Connect to CSV, Google Sheets, SQL databases, Google Analytics, Shopify, Stripe, and more—all in one place.",
  image: featureSources
}, {
  icon: BarChart3,
  title: "Instant Visualizations",
  description: "Beautiful, interactive dashboards generated automatically with charts, graphs, and insights that matter.",
  image: featureDashboard
}, {
  icon: Zap,
  title: "Real-Time Insights",
  description: "Get notified instantly when significant changes or opportunities are detected in your data."
}, {
  icon: Users,
  title: "Team Collaboration",
  description: "Share insights, dashboards, and reports with your team. Comment, discuss, and make data-driven decisions together."
}, {
  icon: Shield,
  title: "Enterprise Security",
  description: "Bank-level encryption, SOC2 compliance, and GDPR-ready data handling to keep your information safe."
}];

const Features = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div />
        </ScrollReveal>
        
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <Card className="group p-8 bg-background border-border hover:border-secondary/30 transition-all duration-500 h-full">
                <div className="flex flex-col space-y-5">
                  <div className="w-14 h-14 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Features;
