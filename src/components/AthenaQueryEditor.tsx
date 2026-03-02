import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search, Play, Save, Clock, Database, Download,
  Copy, Trash2, ChevronDown, ChevronRight, Table2, Columns3
} from "lucide-react";

interface QueryHistoryItem {
  id: string;
  query: string;
  status: "completed" | "failed" | "running";
  duration: string;
  scannedBytes: string;
  timestamp: string;
  rowCount: number;
}

interface CatalogTable {
  name: string;
  columns: { name: string; type: string }[];
}

interface CatalogDatabase {
  name: string;
  tables: CatalogTable[];
}

const mockCatalogs: CatalogDatabase[] = [
  {
    name: "analytics_db",
    tables: [
      { name: "user_events", columns: [{ name: "event_id", type: "string" }, { name: "user_id", type: "string" }, { name: "event_type", type: "string" }, { name: "timestamp", type: "timestamp" }, { name: "properties", type: "map<string,string>" }] },
      { name: "page_views", columns: [{ name: "view_id", type: "string" }, { name: "url", type: "string" }, { name: "referrer", type: "string" }, { name: "duration_ms", type: "bigint" }, { name: "created_at", type: "timestamp" }] },
      { name: "sessions", columns: [{ name: "session_id", type: "string" }, { name: "user_id", type: "string" }, { name: "start_time", type: "timestamp" }, { name: "end_time", type: "timestamp" }, { name: "device", type: "string" }] },
    ],
  },
  {
    name: "sales_datalake",
    tables: [
      { name: "transactions", columns: [{ name: "txn_id", type: "string" }, { name: "amount", type: "decimal(10,2)" }, { name: "currency", type: "string" }, { name: "status", type: "string" }, { name: "created_at", type: "date" }] },
      { name: "products", columns: [{ name: "product_id", type: "string" }, { name: "name", type: "string" }, { name: "category", type: "string" }, { name: "price", type: "decimal(10,2)" }] },
    ],
  },
  {
    name: "raw_logs",
    tables: [
      { name: "cloudtrail_logs", columns: [{ name: "event_id", type: "string" }, { name: "event_name", type: "string" }, { name: "source_ip", type: "string" }, { name: "event_time", type: "timestamp" }] },
      { name: "vpc_flow_logs", columns: [{ name: "log_id", type: "string" }, { name: "src_addr", type: "string" }, { name: "dst_addr", type: "string" }, { name: "bytes", type: "bigint" }, { name: "action", type: "string" }] },
    ],
  },
];

const mockHistory: QueryHistoryItem[] = [
  { id: "1", query: "SELECT event_type, COUNT(*) as cnt FROM analytics_db.user_events GROUP BY event_type ORDER BY cnt DESC LIMIT 10", status: "completed", duration: "3.2s", scannedBytes: "128 MB", timestamp: "10 min ago", rowCount: 10 },
  { id: "2", query: "SELECT DATE(created_at) as day, SUM(amount) as revenue FROM sales_datalake.transactions WHERE status = 'completed' GROUP BY 1 ORDER BY 1 DESC LIMIT 30", status: "completed", duration: "5.8s", scannedBytes: "512 MB", timestamp: "25 min ago", rowCount: 30 },
  { id: "3", query: "SELECT src_addr, COUNT(*) as hits FROM raw_logs.vpc_flow_logs WHERE action = 'REJECT' GROUP BY src_addr HAVING COUNT(*) > 100", status: "failed", duration: "1.1s", scannedBytes: "0 B", timestamp: "1 hour ago", rowCount: 0 },
];

const mockResults = [
  { event_type: "page_view", cnt: 45230 },
  { event_type: "click", cnt: 23100 },
  { event_type: "signup", cnt: 8420 },
  { event_type: "purchase", cnt: 3210 },
  { event_type: "logout", cnt: 2890 },
  { event_type: "search", cnt: 2150 },
  { event_type: "share", cnt: 1040 },
];

export const AthenaQueryEditor = () => {
  const [query, setQuery] = useState(`-- Query your S3 data lake with Athena
SELECT event_type, COUNT(*) as cnt
FROM analytics_db.user_events
WHERE timestamp >= DATE_ADD('day', -7, NOW())
GROUP BY event_type
ORDER BY cnt DESC
LIMIT 10`);
  const [selectedDb, setSelectedDb] = useState("analytics_db");
  const [outputLocation, _setOutputLocation] = useState("s3://athena-results-bucket/output/");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [queryStats, setQueryStats] = useState<{ duration: string; scanned: string; rows: number } | null>(null);
  const [history] = useState<QueryHistoryItem[]>(mockHistory);
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set(["analytics_db"]));
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");

  const toggleDb = (db: string) => {
    const next = new Set(expandedDbs);
    if (next.has(db)) { next.delete(db); } else { next.add(db); }
    setExpandedDbs(next);
  };

  const toggleTable = (key: string) => {
    const next = new Set(expandedTables);
    if (next.has(key)) { next.delete(key); } else { next.add(key); }
    setExpandedTables(next);
  };

  const handleRun = () => {
    if (!query.trim()) { toast.error("Write a query first"); return; }
    setRunning(true);
    setResults(null);
    setQueryStats(null);
    setTimeout(() => {
      setRunning(false);
      setResults(mockResults);
      setQueryStats({ duration: "3.2s", scanned: "128 MB", rows: mockResults.length });
      toast.success("Query completed successfully");
    }, 1800);
  };

  const insertTableRef = (db: string, table: string) => {
    const ref = `${db}.${table}`;
    setQuery((q) => q.trimEnd() + `\n-- Reference: ${ref}\n`);
    toast.info(`Inserted ${ref}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" /> Athena Query Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedDb} onValueChange={setSelectedDb}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockCatalogs.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>Write SQL queries to analyze data in your S3 data lake via Amazon Athena</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Catalog sidebar */}
          <div className="lg:col-span-1 border border-border rounded-lg p-3 max-h-[420px] overflow-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Data Catalog</p>
            {mockCatalogs.map((db) => (
              <div key={db.name} className="mb-1">
                <button onClick={() => toggleDb(db.name)} className="flex items-center gap-1.5 w-full text-left text-sm py-1 px-1 rounded hover:bg-muted/50 transition-colors">
                  {expandedDbs.has(db.name) ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  <Database className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium truncate">{db.name}</span>
                </button>
                {expandedDbs.has(db.name) && db.tables.map((tbl) => {
                  const key = `${db.name}.${tbl.name}`;
                  return (
                    <div key={key} className="ml-5">
                      <button onClick={() => toggleTable(key)} className="flex items-center gap-1.5 w-full text-left text-xs py-0.5 px-1 rounded hover:bg-muted/50 transition-colors group">
                        {expandedTables.has(key) ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        <Table2 className="w-3 h-3 text-secondary" />
                        <span className="truncate">{tbl.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); insertTableRef(db.name, tbl.name); }} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground" title="Insert reference">
                          <Copy className="w-3 h-3" />
                        </button>
                      </button>
                      {expandedTables.has(key) && (
                        <div className="ml-5 space-y-0.5 py-0.5">
                          {tbl.columns.map((col) => (
                            <div key={col.name} className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
                              <Columns3 className="w-2.5 h-2.5" />
                              <span>{col.name}</span>
                              <span className="ml-auto text-[10px] opacity-60">{col.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Editor + results */}
          <div className="lg:col-span-3 space-y-3">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono text-sm min-h-[180px] bg-muted/30"
              placeholder="SELECT * FROM your_table LIMIT 10"
            />

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button onClick={handleRun} disabled={running} size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  {running ? "Running..." : "Run Query"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info("Query saved to your workspace")}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setResults(null); setQueryStats(null); }}>
                  <Trash2 className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                Output: <span className="font-mono">{outputLocation}</span>
              </div>
            </div>

            {/* Results / History tabs */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex border-b border-border bg-muted/30">
                <button onClick={() => setActiveTab("results")} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "results" ? "bg-background text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  Results {queryStats && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{queryStats.rows}</Badge>}
                </button>
                <button onClick={() => setActiveTab("history")} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "history" ? "bg-background text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Clock className="w-3 h-3 inline mr-1" /> History
                </button>
              </div>

              {activeTab === "results" && (
                <div className="p-3">
                  {running && (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3" />
                      Executing query...
                    </div>
                  )}
                  {!running && !results && (
                    <p className="text-sm text-muted-foreground text-center py-12">Run a query to see results here</p>
                  )}
                  {!running && results && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Duration: <strong className="text-foreground">{queryStats?.duration}</strong></span>
                          <span>Scanned: <strong className="text-foreground">{queryStats?.scanned}</strong></span>
                          <span>Rows: <strong className="text-foreground">{queryStats?.rows}</strong></span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Results downloaded as CSV")}>
                          <Download className="w-3 h-3 mr-1" /> Export CSV
                        </Button>
                      </div>
                      <div className="overflow-auto max-h-[260px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-background">
                            <tr className="border-b border-border">
                              {Object.keys(results[0]).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((row, i) => (
                              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-3 py-2 font-mono text-xs">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="p-3 space-y-2 max-h-[300px] overflow-auto">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-2.5 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setQuery(item.query); setActiveTab("results"); toast.info("Query loaded from history"); }}>
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-mono text-xs truncate">{item.query}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span>{item.timestamp}</span>
                          <span>•</span>
                          <span>{item.duration}</span>
                          <span>•</span>
                          <span>{item.scannedBytes} scanned</span>
                        </div>
                      </div>
                      <Badge variant={item.status === "completed" ? "secondary" : "destructive"} className="text-[10px] shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
