import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Code, Wand2, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QueryTemplates } from "./QueryTemplates";
import { VisualQueryBuilder } from "./VisualQueryBuilder";
import { validateSQLQuery, ValidationResult } from "@/lib/sqlValidator";

interface ConnectDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataImported: (data: any[], fields: string[]) => void;
}

export const ConnectDatabaseDialog = ({
  open,
  onOpenChange,
  onDataImported,
}: ConnectDatabaseDialogProps) => {
  const [connecting, setConnecting] = useState(false);
  const [dbType, setDbType] = useState<string>("postgresql");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("SELECT * FROM table_name LIMIT 1000");
  const [queryMode, setQueryMode] = useState<"manual" | "visual" | "templates">("visual");
  const [validationResult, setValidationResult] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [] 
  });

  const saveQueryToHistory = (query: string) => {
    try {
      const history = localStorage.getItem("queryHistory");
      const queries = history ? JSON.parse(history) : [];
      
      // Add new query to the beginning and remove duplicates
      const updatedQueries = [query, ...queries.filter((q: string) => q !== query)];
      
      // Keep only last 10 queries
      const limitedQueries = updatedQueries.slice(0, 10);
      
      localStorage.setItem("queryHistory", JSON.stringify(limitedQueries));
    } catch (error) {
      console.error("Failed to save query history:", error);
    }
  };

  const handleConnect = async () => {
    if (!host || !database || !username || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate query before connecting
    const validation = validateSQLQuery(query, dbType);
    setValidationResult(validation);
    
    if (!validation.isValid) {
      toast.error("Query validation failed. Please fix the errors before connecting.");
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-external-database', {
        body: {
          dbType,
          host,
          port: port || getDefaultPort(dbType),
          database,
          username,
          password,
          query,
        },
      });

      if (error) throw error;

      if (data?.rows && data.rows.length > 0) {
        const fields = Object.keys(data.rows[0]);
        onDataImported(data.rows, fields);
        
        // Save successful query to history
        saveQueryToHistory(query);
        
        toast.success(`Successfully imported ${data.rows.length} rows from ${dbType} database`);
        onOpenChange(false);
        
        // Clear form
        setHost("");
        setPort("");
        setDatabase("");
        setUsername("");
        setPassword("");
        setQuery("SELECT * FROM table_name LIMIT 1000");
      } else {
        toast.error("No data returned from query");
      }
    } catch (error: any) {
      console.error("Database connection error:", error);
      toast.error(error.message || "Failed to connect to database");
    } finally {
      setConnecting(false);
    }
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    // Validate query on change
    const validation = validateSQLQuery(newQuery, dbType);
    setValidationResult(validation);
  };

  const getDefaultPort = (type: string) => {
    switch (type) {
      case "postgresql":
        return "5432";
      case "mysql":
        return "3306";
      case "sqlserver":
        return "1433";
      default:
        return "5432";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect External Database</DialogTitle>
          <DialogDescription>
            Connect to your external database and import data. Your credentials are
            encrypted and used only for this connection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dbType">Database Type</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger id="dbType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL / MariaDB</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host *</Label>
              <Input
                id="host"
                placeholder="localhost or IP address"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder={getDefaultPort(dbType)}
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Database Name *</Label>
            <Input
              id="database"
              placeholder="my_database"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="database_user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Query Builder</Label>
            <Tabs value={queryMode} onValueChange={(v: any) => setQueryMode(v)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual" className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  SQL
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="mt-3">
                <VisualQueryBuilder 
                  onQueryGenerated={handleQueryChange}
                  dbType={dbType}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-3 space-y-2">
                <Label htmlFor="query">SQL Query</Label>
                <textarea
                  id="query"
                  className="w-full min-h-[200px] px-3 py-2 text-sm rounded-md border border-input bg-background font-mono"
                  placeholder="SELECT * FROM table_name LIMIT 1000"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your SQL query to fetch data. Limit to 10,000 rows for best performance.
                </p>
              </TabsContent>

              <TabsContent value="templates" className="mt-3">
                <QueryTemplates 
                  onSelectQuery={(q) => {
                    handleQueryChange(q);
                    setQueryMode("manual");
                  }}
                  currentDbType={dbType}
                />
              </TabsContent>
            </Tabs>

            {query && (
              <div className="rounded-lg bg-muted p-3 mt-3">
                <p className="text-xs font-medium mb-1 text-muted-foreground">Generated Query:</p>
                <code className="text-xs block overflow-x-auto">{query}</code>
              </div>
            )}

            {/* Validation Results */}
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Query Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.warnings.length > 0 && validationResult.errors.length === 0 && (
              <Alert className="mt-3 border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-600">Query Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-600">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={connecting || !validationResult.isValid}
          >
            {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Connect & Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
