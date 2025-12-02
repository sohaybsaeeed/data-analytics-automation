const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12 border-transparent">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            
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
    </footer>;
};
export default Footer;