import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
const Navbar = () => {
  return <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            
            <span className="text-xl font-bold">Data Analytics Automation</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
            
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;