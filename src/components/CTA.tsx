import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-card" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/2 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-6xl font-semibold leading-tight">
            Ready to Transform Your
            <span className="block text-gradient mt-2">Data Into Growth?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands of companies already using AI-powered insights to make better decisions, 
            faster. Start your free 14-day trial today—no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="group min-w-[200px]" 
              onClick={() => window.location.href = '/auth'}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>✓ No credit card required</span>
            <span>✓ 14-day free trial</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Setup in 5 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
