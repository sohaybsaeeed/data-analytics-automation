import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <motion.a
      href={href}
      className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
      whileHover="hover"
    >
      {children}
      <motion.span
        className="absolute bottom-0 left-0 w-full h-px bg-secondary"
        initial={{ scaleX: 0 }}
        variants={{
          hover: { scaleX: 1 }
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ originX: 0 }}
      />
    </motion.a>
  );
};

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xl font-bold">Data Analytics Automation</span>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex hover:bg-secondary/10" 
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
