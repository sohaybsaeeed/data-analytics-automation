import { FileSpreadsheet, Database, FileJson, FileText, CloudUpload, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const DataSources = () => {
  const fileSources = [
    {
      icon: FileSpreadsheet,
      name: "Excel Files",
      description: "XLSX, XLS - Full support for spreadsheets with multiple sheets",
      color: "text-green-500"
    },
    {
      icon: FileText,
      name: "CSV Files",
      description: "Comma-separated values with automatic delimiter detection",
      color: "text-blue-500"
    },
    {
      icon: FileJson,
      name: "JSON Data",
      description: "Structured JSON files with nested object support",
      color: "text-yellow-500"
    },
    {
      icon: CloudUpload,
      name: "Cloud Storage",
      description: "Import from Google Drive, Dropbox, and cloud services",
      color: "text-purple-500"
    }
  ];

  const databaseSources = [
    {
      icon: Database,
      name: "PostgreSQL",
      description: "Direct connection to PostgreSQL databases",
      color: "text-blue-600"
    },
    {
      icon: Database,
      name: "MySQL / MariaDB",
      description: "Connect to MySQL and MariaDB instances",
      color: "text-orange-500"
    },
    {
      icon: Database,
      name: "SQL Server",
      description: "Microsoft SQL Server integration",
      color: "text-red-500"
    },
    {
      icon: Link2,
      name: "REST APIs",
      description: "Pull data from any REST API endpoint",
      color: "text-indigo-500"
    }
  ];

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Connect Your Data
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              From Any Source
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate with multiple file formats and database systems. Our platform supports all major data sources.
          </p>
        </div>

        <div className="grid gap-12">
          {/* File Formats Section */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              File Formats
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fileSources.map((source) => (
                <Card 
                  key={source.name}
                  className="p-6 hover:shadow-lg transition-shadow bg-card border-border"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-14 h-14 rounded-xl bg-background flex items-center justify-center ${source.color}`}>
                      <source.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Database Connections Section */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Database Connections
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {databaseSources.map((source) => (
                <Card 
                  key={source.name}
                  className="p-6 hover:shadow-lg transition-shadow bg-card border-border"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-14 h-14 rounded-xl bg-background flex items-center justify-center ${source.color}`}>
                      <source.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium">Real-time sync</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium">Secure connections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium">Automatic schema detection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataSources;
