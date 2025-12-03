import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: backgroundY, scale: backgroundScale }}
      >
        <img 
          src={heroBg} 
          alt="Data analytics background" 
          className="w-full h-full object-cover opacity-10" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </motion.div>
      
      {/* Subtle decorative elements with parallax */}
      <motion.div 
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "40%"]) }}
      />
      <motion.div 
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.7, 0.5, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "50%"]) }}
      />
      
      {/* Decorative lines */}
      <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Content with parallax */}
      <motion.div 
        className="container mx-auto px-4 relative z-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <motion.div 
            className="inline-flex items-center gap-3 px-5 py-2 border border-border/50 bg-card/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">Powered by Advanced AI</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-foreground leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Data Analytics
            <span className="block text-gradient mt-2">Automation</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Advanced AI-powered analytics with DAX, pivot tables, statistical testing, 
            and comprehensive visualizations—professional data science capabilities 
            at your fingertips.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => window.location.href = '/auth'} 
              className="group min-w-[200px]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
