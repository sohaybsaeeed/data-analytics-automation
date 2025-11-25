import { Card } from "@/components/ui/card";
import { Brain, Database, BarChart3, Zap, Users, Shield } from "lucide-react";
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
  return <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="block bg-transparent text-sky-600">Master Your Data</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to turn complex data into clear, actionable insights
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {})}
        </div>
      </div>
    </section>;
};
export default Features;