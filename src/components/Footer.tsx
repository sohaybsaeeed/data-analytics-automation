import { TrendingUp } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Data Analytics Automation</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Advanced AI-powered data analysis platform for professionals and enterprises
          </p>
          <div className="text-sm text-muted-foreground">
            © {currentYear} Data Analytics Automation. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
