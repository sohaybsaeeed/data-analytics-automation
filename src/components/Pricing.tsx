import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 250,
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
    monthlyPrice: 500,
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
    monthlyPrice: 1000,
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

const ANNUAL_DISCOUNT = 0.2; // 20% discount

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      return Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT));
    }
    return monthlyPrice;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent
            <span className="block text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <motion.div 
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              Save 20%
            </span>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card 
                className={`p-8 relative h-full transition-shadow duration-300 ${
                  plan.popular 
                    ? 'border-primary shadow-[var(--shadow-glow)] scale-105' 
                    : 'border-border/50 hover:shadow-lg hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold rounded-full"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    Most Popular
                  </motion.div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold">$</span>
                    <motion.span 
                      className="text-5xl font-bold"
                      key={`${plan.name}-${isAnnual}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getPrice(plan.monthlyPrice)}
                    </motion.span>
                    <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
                  </div>

                  {isAnnual && (
                    <motion.p 
                      className="text-sm text-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ${plan.monthlyPrice * 12 - getPrice(plan.monthlyPrice)} saved annually
                    </motion.p>
                  )}
                  
                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                  
                  <div className="space-y-3 pt-6 border-t border-border">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * featureIndex, duration: 0.3 }}
                      >
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
