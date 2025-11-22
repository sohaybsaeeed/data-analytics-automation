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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QueryTemplates } from "./QueryTemplates";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label htmlFor="query">SQL Query</Label>
            <textarea
              id="query"
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              placeholder="SELECT * FROM table_name LIMIT 1000"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your SQL query to fetch data. Limit to 10,000 rows for best performance.
            </p>
          </div>

          <QueryTemplates 
            onSelectQuery={setQuery} 
            currentDbType={dbType}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Connect & Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
