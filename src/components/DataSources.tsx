import { FileSpreadsheet, Database, FileJson, FileText, CloudUpload, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const DataSources = () => {
  const fileSources = [
    {
      icon: FileSpreadsheet,
      name: "Excel Files",
      description: "XLSX, XLS - Full support for spreadsheets with multiple sheets"
    },
    {
      icon: FileText,
      name: "CSV Files",
      description: "Comma-separated values with automatic delimiter detection"
    },
    {
      icon: FileJson,
      name: "JSON Data",
      description: "Structured JSON files with nested object support"
    },
    {
      icon: CloudUpload,
      name: "Cloud Storage",
      description: "Import from Google Drive, Dropbox, and cloud services"
    }
  ];

  const databaseSources = [
    {
      icon: Database,
      name: "PostgreSQL",
      description: "Direct connection to PostgreSQL databases"
    },
    {
      icon: Database,
      name: "MySQL / MariaDB",
      description: "Connect to MySQL and MariaDB instances"
    },
    {
      icon: Database,
      name: "SQL Server",
      description: "Microsoft SQL Server integration"
    },
    {
      icon: Link2,
      name: "REST APIs",
      description: "Pull data from any REST API endpoint"
    }
  ];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            Connect Your Data
          </h2>
        </ScrollReveal>

        <div className="grid gap-16">
          {/* File Formats Section */}
          <div>
            <ScrollReveal delay={0.1}>
              <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-8 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                File Formats
              </h3>
            </ScrollReveal>
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
              {fileSources.map((source) => (
                <StaggerItem key={source.name}>
                  <Card className="group p-8 bg-card border-border hover:border-secondary/30 transition-all duration-500 h-full">
                    <div className="flex flex-col items-center text-center space-y-5">
                      <div className="w-14 h-14 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                        <source.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{source.name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{source.description}</p>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Database Connections Section */}
          <div>
            <ScrollReveal delay={0.1}>
              <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-8 flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                Database Connections
              </h3>
            </ScrollReveal>
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
              {databaseSources.map((source) => (
                <StaggerItem key={source.name}>
                  <Card className="group p-8 bg-card border-border hover:border-secondary/30 transition-all duration-500 h-full">
                    <div className="flex flex-col items-center text-center space-y-5">
                      <div className="w-14 h-14 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                        <source.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{source.name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{source.description}</p>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>

        {/* Additional Info */}
        <ScrollReveal className="mt-12 text-center" delay={0.3}>
          <div className="inline-flex items-center gap-8 px-8 py-5 border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">Real-time sync</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">Secure connections</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">Automatic schema detection</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DataSources;
