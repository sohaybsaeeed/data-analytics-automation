import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HardDrive,
  Folder,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  ChevronRight,
  ArrowUp,
  Search,
  Download,
  Trash2,
  Upload,
  RefreshCw,
  Info,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface S3Object {
  key: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  lastModified?: string;
  storageClass?: string;
  etag?: string;
}

interface S3Bucket {
  name: string;
  region: string;
  createdAt: string;
  objectCount: number;
  totalSize: string;
}

const mockBuckets: S3Bucket[] = [
  { name: "data-lake-raw", region: "us-east-1", createdAt: "2024-08-15", objectCount: 12450, totalSize: "2.4 TB" },
  { name: "data-lake-processed", region: "us-east-1", createdAt: "2024-08-15", objectCount: 8320, totalSize: "1.1 TB" },
  { name: "analytics-exports", region: "us-west-2", createdAt: "2024-11-02", objectCount: 540, totalSize: "85 GB" },
  { name: "ml-model-artifacts", region: "us-east-1", createdAt: "2025-01-10", objectCount: 230, totalSize: "42 GB" },
  { name: "etl-temp-storage", region: "eu-west-1", createdAt: "2024-09-20", objectCount: 1890, totalSize: "320 GB" },
];

const mockFileTree: Record<string, S3Object[]> = {
  "/": [
    { key: "raw/", name: "raw", type: "folder" },
    { key: "processed/", name: "processed", type: "folder" },
    { key: "curated/", name: "curated", type: "folder" },
    { key: "temp/", name: "temp", type: "folder" },
    { key: "config.json", name: "config.json", type: "file", size: 2048, lastModified: "2025-02-28 14:30", storageClass: "STANDARD" },
    { key: "schema.avro", name: "schema.avro", type: "file", size: 4096, lastModified: "2025-02-27 09:15", storageClass: "STANDARD" },
  ],
  "raw/": [
    { key: "raw/events/", name: "events", type: "folder" },
    { key: "raw/transactions/", name: "transactions", type: "folder" },
    { key: "raw/users/", name: "users", type: "folder" },
    { key: "raw/logs/", name: "logs", type: "folder" },
    { key: "raw/manifest.json", name: "manifest.json", type: "file", size: 1024, lastModified: "2025-03-01 08:00", storageClass: "STANDARD" },
  ],
  "raw/events/": [
    { key: "raw/events/2025-03-01/", name: "2025-03-01", type: "folder" },
    { key: "raw/events/2025-02-28/", name: "2025-02-28", type: "folder" },
    { key: "raw/events/2025-02-27/", name: "2025-02-27", type: "folder" },
    { key: "raw/events/_schema.parquet", name: "_schema.parquet", type: "file", size: 512, lastModified: "2025-03-01 00:05", storageClass: "STANDARD" },
  ],
  "raw/events/2025-03-01/": [
    { key: "raw/events/2025-03-01/part-00000.parquet", name: "part-00000.parquet", type: "file", size: 134217728, lastModified: "2025-03-01 06:30", storageClass: "STANDARD" },
    { key: "raw/events/2025-03-01/part-00001.parquet", name: "part-00001.parquet", type: "file", size: 128974848, lastModified: "2025-03-01 06:30", storageClass: "STANDARD" },
    { key: "raw/events/2025-03-01/part-00002.parquet", name: "part-00002.parquet", type: "file", size: 141557760, lastModified: "2025-03-01 06:31", storageClass: "STANDARD" },
    { key: "raw/events/2025-03-01/_SUCCESS", name: "_SUCCESS", type: "file", size: 0, lastModified: "2025-03-01 06:31", storageClass: "STANDARD" },
  ],
  "processed/": [
    { key: "processed/daily_aggregates/", name: "daily_aggregates", type: "folder" },
    { key: "processed/user_profiles/", name: "user_profiles", type: "folder" },
    { key: "processed/revenue_reports/", name: "revenue_reports", type: "folder" },
  ],
  "curated/": [
    { key: "curated/dim_users.parquet", name: "dim_users.parquet", type: "file", size: 52428800, lastModified: "2025-03-01 10:00", storageClass: "STANDARD_IA" },
    { key: "curated/fact_events.parquet", name: "fact_events.parquet", type: "file", size: 524288000, lastModified: "2025-03-01 10:05", storageClass: "STANDARD_IA" },
    { key: "curated/dim_products.parquet", name: "dim_products.parquet", type: "file", size: 10485760, lastModified: "2025-02-28 22:00", storageClass: "STANDARD_IA" },
  ],
  "temp/": [
    { key: "temp/glue_temp_001.csv", name: "glue_temp_001.csv", type: "file", size: 2097152, lastModified: "2025-03-01 12:00", storageClass: "STANDARD" },
    { key: "temp/spark_shuffle/", name: "spark_shuffle", type: "folder" },
  ],
};

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
};

const getFileIcon = (name: string, type: "folder" | "file") => {
  if (type === "folder") return <Folder className="w-4 h-4 text-yellow-500" />;
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "parquet":
    case "avro":
    case "orc":
      return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    case "csv":
    case "tsv":
      return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
    case "json":
    case "yaml":
    case "yml":
      return <FileCode className="w-4 h-4 text-orange-500" />;
    case "gz":
    case "zip":
    case "tar":
      return <FileArchive className="w-4 h-4 text-purple-500" />;
    case "txt":
    case "log":
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
};

export const S3BucketBrowser = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const breadcrumbs = currentPath === "/"
    ? ["/"]
    : ["/", ...currentPath.split("/").filter(Boolean).map((_, i, arr) => arr.slice(0, i + 1).join("/") + "/")];

  const currentObjects = mockFileTree[currentPath === "/" ? "/" : currentPath] || [];
  const filteredObjects = searchQuery
    ? currentObjects.filter((obj) => obj.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentObjects;

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSearchQuery("");
    setSelectedFiles(new Set());
  };

  const toggleSelect = (key: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleBucketSelect = (bucket: string) => {
    setSelectedBucket(bucket);
    setCurrentPath("/");
    setSearchQuery("");
    setSelectedFiles(new Set());
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" /> S3 Bucket Browser
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("Upload functionality requires AWS credentials.")}>
              <Upload className="w-4 h-4 mr-1" /> Upload
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Refreshing bucket contents...")}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bucket Selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedBucket} onValueChange={handleBucketSelect}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a bucket..." />
            </SelectTrigger>
            <SelectContent>
              {mockBuckets.map((bucket) => (
                <SelectItem key={bucket.name} value={bucket.name}>
                  <span className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3" />
                    {bucket.name}
                    <span className="text-xs text-muted-foreground">({bucket.region})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBucket && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{mockBuckets.find((b) => b.name === selectedBucket)?.objectCount.toLocaleString()} objects</span>
              <span>•</span>
              <span>{mockBuckets.find((b) => b.name === selectedBucket)?.totalSize}</span>
            </div>
          )}
        </div>

        {selectedBucket ? (
          <>
            {/* Breadcrumb + Search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 flex-1 text-sm overflow-x-auto">
                <span className="font-mono text-muted-foreground">s3://{selectedBucket}/</span>
                {breadcrumbs.slice(1).map((crumb, i) => {
                  const segment = crumb.split("/").filter(Boolean).pop() || "";
                  return (
                    <span key={crumb} className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <button
                        onClick={() => navigateTo(crumb)}
                        className="text-primary hover:underline font-mono"
                      >
                        {segment}
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            {/* Action bar */}
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">{selectedFiles.size} selected</span>
                <Button variant="ghost" size="sm" onClick={() => toast.info("Download requires AWS credentials.")}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  const paths = Array.from(selectedFiles).map((k) => `s3://${selectedBucket}/${k}`).join("\n");
                  navigator.clipboard.writeText(paths);
                  toast.success("Paths copied to clipboard");
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Path
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => toast.info("Delete requires AWS credentials.")}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles(new Set())}>
                  Clear
                </Button>
              </div>
            )}

            {/* File listing */}
            <ScrollArea className="h-[400px]">
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[auto_1fr_100px_140px_100px] gap-3 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
                  <div className="w-5" />
                  <div>Name</div>
                  <div className="text-right">Size</div>
                  <div>Last Modified</div>
                  <div>Class</div>
                </div>

                {/* Navigate up */}
                {currentPath !== "/" && (
                  <button
                    onClick={() => {
                      const parts = currentPath.split("/").filter(Boolean);
                      parts.pop();
                      navigateTo(parts.length === 0 ? "/" : parts.join("/") + "/");
                    }}
                    className="w-full grid grid-cols-[auto_1fr_100px_140px_100px] gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-border/50"
                  >
                    <ArrowUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-left text-muted-foreground">..</span>
                    <span />
                    <span />
                    <span />
                  </button>
                )}

                {/* Objects */}
                {filteredObjects.length > 0 ? (
                  filteredObjects.map((obj) => (
                    <div
                      key={obj.key}
                      className={`grid grid-cols-[auto_1fr_100px_140px_100px] gap-3 px-3 py-2.5 text-sm border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                        selectedFiles.has(obj.key) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        if (obj.type === "folder") navigateTo(obj.key);
                        else toggleSelect(obj.key);
                      }}
                    >
                      <div className="flex items-center">
                        {obj.type === "file" && (
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(obj.key)}
                            onChange={() => toggleSelect(obj.key)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-3.5 h-3.5 rounded border-border"
                          />
                        )}
                        {obj.type === "folder" && <div className="w-3.5" />}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(obj.name, obj.type)}
                        <span className={`truncate font-mono text-xs ${obj.type === "folder" ? "font-medium" : ""}`}>
                          {obj.name}{obj.type === "folder" ? "/" : ""}
                        </span>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {obj.type === "file" ? formatFileSize(obj.size) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {obj.lastModified || "—"}
                      </div>
                      <div>
                        {obj.storageClass && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {obj.storageClass === "STANDARD_IA" ? "IA" : obj.storageClass?.slice(0, 4)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Info className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No objects found</p>
                    {searchQuery && <p className="text-xs mt-1">Try a different search term</p>}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <HardDrive className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Select a bucket to browse</p>
            <p className="text-sm mt-1">Choose from {mockBuckets.length} available buckets above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
