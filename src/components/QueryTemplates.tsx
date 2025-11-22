import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText, Copy } from "lucide-react";
import { toast } from "sonner";

interface QueryTemplate {
  name: string;
  description: string;
  query: string;
  dbType?: string;
}

interface QueryTemplatesProps {
  onSelectQuery: (query: string) => void;
  currentDbType: string;
}

const templates: QueryTemplate[] = [
  {
    name: "All Records",
    description: "Fetch all records from a table",
    query: "SELECT * FROM table_name LIMIT 1000",
  },
  {
    name: "Recent Records",
    description: "Get records from the last 30 days",
    query: "SELECT * FROM table_name WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' LIMIT 1000",
    dbType: "postgresql",
  },
  {
    name: "Recent Records (MySQL)",
    description: "Get records from the last 30 days",
    query: "SELECT * FROM table_name WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) LIMIT 1000",
    dbType: "mysql",
  },
  {
    name: "Aggregated Data",
    description: "Get grouped and aggregated data",
    query: "SELECT category, COUNT(*) as count, AVG(value) as avg_value FROM table_name GROUP BY category LIMIT 1000",
  },
  {
    name: "Join Tables",
    description: "Combine data from multiple tables",
    query: "SELECT a.*, b.name FROM table_a a LEFT JOIN table_b b ON a.id = b.table_a_id LIMIT 1000",
  },
  {
    name: "Top Records",
    description: "Get top records by a metric",
    query: "SELECT * FROM table_name ORDER BY value DESC LIMIT 100",
  },
  {
    name: "Filtered Records",
    description: "Get records matching specific criteria",
    query: "SELECT * FROM table_name WHERE status = 'active' AND value > 0 LIMIT 1000",
  },
  {
    name: "Date Range",
    description: "Get records within a date range",
    query: "SELECT * FROM table_name WHERE date_column BETWEEN '2024-01-01' AND '2024-12-31' LIMIT 1000",
  },
  {
    name: "Distinct Values",
    description: "Get unique values from a column",
    query: "SELECT DISTINCT column_name FROM table_name ORDER BY column_name LIMIT 1000",
  },
];

export const QueryTemplates = ({ onSelectQuery, currentDbType }: QueryTemplatesProps) => {
  const getQueryHistory = (): string[] => {
    try {
      const history = localStorage.getItem("queryHistory");
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  };

  const filteredTemplates = templates.filter(
    (t) => !t.dbType || t.dbType === currentDbType
  );

  const history = getQueryHistory();

  const handleSelectTemplate = (query: string) => {
    onSelectQuery(query);
    toast.success("Query template applied");
  };

  const handleCopyQuery = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(query);
    toast.success("Query copied to clipboard");
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-3">
          <ScrollArea className="h-[300px] w-full rounded-md border p-3">
            <div className="space-y-2">
              {filteredTemplates.map((template, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg border bg-card p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectTemplate(template.query)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                        {template.query}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleCopyQuery(template.query, e)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          <ScrollArea className="h-[300px] w-full rounded-md border p-3">
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.slice(0, 10).map((query, index) => (
                  <div
                    key={index}
                    className="group relative rounded-lg border bg-card p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelectTemplate(query)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto flex-1">
                        {query}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleCopyQuery(query, e)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Clock className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No query history yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your successful queries will appear here
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
