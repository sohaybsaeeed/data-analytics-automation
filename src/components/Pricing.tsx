import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "250",
    description: "Perfect for individuals and small teams",
    features: [
      "Up to 10 data sources",
      "100 GB data storage",
      "Basic AI insights",
      "Standard visualizations",
      "Email support",
      "14-day data retention",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "500",
    description: "For growing businesses with complex data",
    features: [
      "Unlimited data sources",
      "500 GB data storage",
      "Advanced AI insights",
      "Custom visualizations",
      "Priority support",
      "60-day data retention",
      "Team collaboration",
      "API access",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    price: "1000",
    description: "Complete solution for large organizations",
    features: [
      "Everything in Professional",
      "Unlimited data storage",
      "Custom AI models",
      "White-label options",
      "Dedicated support",
      "Unlimited data retention",
      "SSO & advanced security",
      "Custom integrations",
    ],
    cta: "Get Started",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-muted/20 to-background">
    
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent
            <span className="block text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 relative ${
                plan.popular 
                  ? 'border-primary shadow-[var(--shadow-glow)] scale-105' 
                  : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline gap-1">
                  {plan.price !== "Custom" && <span className="text-xl font-semibold">$</span>}
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                
                <Button 
                  variant={plan.popular ? "hero" : "outline"} 
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3 pt-6 border-t border-border">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
