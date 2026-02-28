import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LogOut, Cloud, Database, Server, Workflow, Warehouse,
  HardDrive, Search, Zap, Shield, Cpu, Globe, Layers, Play, Plus,
  Settings, RefreshCw, Eye, CheckCircle2, XCircle, Clock,
  ArrowLeft
} from "lucide-react";

type ServiceStatus = "connected" | "disconnected" | "configuring";

interface CloudAccount {
  provider: string;
  status: ServiceStatus;
  region?: string;
}

interface PipelineJob {
  id: string;
  name: string;
  service: string;
  status: "running" | "completed" | "failed" | "pending";
  lastRun?: string;
  schedule?: string;
}

const mockPipelines: PipelineJob[] = [
  { id: "1", name: "Sales ETL Pipeline", service: "AWS Glue", status: "completed", lastRun: "2 hours ago", schedule: "Daily 6:00 AM" },
  { id: "2", name: "User Events Stream", service: "Lambda + EventBridge", status: "running", lastRun: "Running now", schedule: "Real-time" },
  { id: "3", name: "Data Lake Ingestion", service: "S3 + Lake Formation", status: "completed", lastRun: "1 hour ago", schedule: "Hourly" },
  { id: "4", name: "Analytics Warehouse Load", service: "Redshift", status: "failed", lastRun: "30 min ago", schedule: "Daily 8:00 AM" },
  { id: "5", name: "Spark Transformation", service: "EMR / PySpark", status: "pending", schedule: "On-demand" },
];

const statusIcon = (status: string) => {
  switch (status) {
    case "running": return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "failed": return <XCircle className="w-4 h-4 text-destructive" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const statusBadge = (status: string) => {
  const variants: Record<string, string> = {
    running: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    completed: "bg-green-500/10 text-green-600 border-green-500/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    pending: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border rounded-full ${variants[status] || variants.pending}`}>
      {statusIcon(status)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const awsServiceCards = [
  { icon: Workflow, name: "AWS Glue", desc: "ETL Jobs & Crawlers", count: 12 },
  { icon: Cpu, name: "EMR Clusters", desc: "Spark & Hadoop", count: 3 },
  { icon: Warehouse, name: "Redshift", desc: "Data Warehouse", count: 2 },
  { icon: HardDrive, name: "S3 Data Lake", desc: "Buckets & Objects", count: 47 },
  { icon: Database, name: "DynamoDB", desc: "NoSQL Tables", count: 8 },
  { icon: Search, name: "Athena", desc: "SQL Queries", count: 24 },
  { icon: Zap, name: "Lambda", desc: "Serverless Functions", count: 15 },
  { icon: Shield, name: "Lake Formation", desc: "Governance & Access", count: 5 },
  { icon: Server, name: "EC2 Instances", desc: "Compute Management", count: 6 },
  { icon: Workflow, name: "Step Functions", desc: "Workflow Orchestration", count: 4 },
];

const DataEngineeringDashboard = () => {
  const [_user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudAccount, setCloudAccount] = useState<CloudAccount>({ provider: "AWS", status: "disconnected" });
  const [pipelines] = useState<PipelineJob[]>(mockPipelines);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleConnectAWS = () => {
    toast.info("AWS credential configuration will be available once you provide your Access Key and Secret Key.");
    setCloudAccount({ provider: "AWS", status: "configuring" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Data Engineering</span>
              </div>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Cloud Connection Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" /> Cloud Provider Connection
                </CardTitle>
                <CardDescription>Connect your AWS, Azure, or GCP account to manage data engineering services</CardDescription>
              </div>
              {cloudAccount.status === "disconnected" ? (
                <Button variant="hero" onClick={handleConnectAWS}>
                  <Plus className="w-4 h-4 mr-2" /> Connect AWS
                </Button>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Settings className="w-3 h-3 mr-1" /> Configuration Pending
                </Badge>
              )}
            </div>
          </CardHeader>
          {cloudAccount.status === "configuring" && (
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
                <div className="space-y-2">
                  <Label>AWS Access Key ID</Label>
                  <Input placeholder="AKIA..." type="password" />
                </div>
                <div className="space-y-2">
                  <Label>AWS Secret Access Key</Label>
                  <Input placeholder="Your secret key" type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Default Region</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                      <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={() => toast.info("AWS credentials will be securely stored once the integration is complete.")}>
                    Save & Connect
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Credentials are encrypted and stored securely. We recommend creating an IAM user with least-privilege access.
              </p>
            </CardContent>
          )}
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="services">AWS Services</TabsTrigger>
            <TabsTrigger value="multicloud">Multi-Cloud</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Pipelines</CardDescription>
                  <CardTitle className="text-3xl">{pipelines.filter(p => p.status === "running").length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Jobs Today</CardDescription>
                  <CardTitle className="text-3xl">24</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Data Processed</CardDescription>
                  <CardTitle className="text-3xl">1.2 TB</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-3xl text-green-600">96%</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Pipelines */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Pipeline Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {statusIcon(pipeline.status)}
                        <div>
                          <p className="font-medium text-sm">{pipeline.name}</p>
                          <p className="text-xs text-muted-foreground">{pipeline.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">{pipeline.lastRun || "Not run yet"}</span>
                        {statusBadge(pipeline.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipelines */}
          <TabsContent value="pipelines" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Data Pipelines</h2>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" /> Create Pipeline
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        {statusIcon(pipeline.status)}
                        <div>
                          <p className="font-semibold">{pipeline.name}</p>
                          <p className="text-sm text-muted-foreground">{pipeline.service} • Schedule: {pipeline.schedule}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(pipeline.status)}
                        <Button variant="ghost" size="sm"><Play className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AWS Services */}
          <TabsContent value="services" className="space-y-6">
            <h2 className="text-2xl font-bold">AWS Services</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {awsServiceCards.map((service) => (
                <Card key={service.name} className="group hover:border-secondary/30 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 transition-colors">
                          <service.icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground">{service.count}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{service.name}</h4>
                        <p className="text-xs text-muted-foreground">{service.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Glue Jobs Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" /> AWS Glue Jobs
                  </CardTitle>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Job</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["ETL_Sales_Transform", "Crawl_S3_DataLake", "Load_Redshift_DW", "Clean_User_Events"].map((job, i) => (
                    <div key={job} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {statusIcon(["completed", "running", "completed", "pending"][i])}
                        <span className="font-mono text-sm">{job}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(["completed", "running", "completed", "pending"][i])}
                        <Button variant="ghost" size="sm"><Play className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi-Cloud */}
          <TabsContent value="multicloud" className="space-y-6">
            <h2 className="text-2xl font-bold">Multi-Cloud & Big Data</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Apache Spark / PySpark
                  </CardTitle>
                  <CardDescription>Distributed data processing across cloud platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Spark Jobs</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Executors</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data Processed Today</span>
                      <span className="font-semibold">450 GB</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      <Play className="w-4 h-4 mr-2" /> Submit Spark Job
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" /> Apache Airflow & Kafka
                  </CardTitle>
                  <CardDescription>Workflow orchestration and real-time streaming</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active DAGs</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kafka Topics</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Messages/sec</span>
                      <span className="font-semibold">15,420</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      <Eye className="w-4 h-4 mr-2" /> View DAGs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" /> Azure Data Services
                  </CardTitle>
                  <CardDescription>Azure Data Factory, Databricks, Synapse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data Factory Pipelines</span>
                      <span className="font-semibold">6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Databricks Clusters</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2" onClick={() => toast.info("Connect your Azure account to access Data Factory and Databricks.")}>
                      <Plus className="w-4 h-4 mr-2" /> Connect Azure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" /> Hadoop Ecosystem
                  </CardTitle>
                  <CardDescription>HDFS, MapReduce, YARN, Hive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">HDFS Capacity Used</span>
                      <span className="font-semibold">2.4 TB / 10 TB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">YARN Applications</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hive Tables</span>
                      <span className="font-semibold">34</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      <Search className="w-4 h-4 mr-2" /> Query Hive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <h2 className="text-2xl font-bold">Pipeline Monitoring</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Jobs Last 24h</CardDescription>
                  <CardTitle className="text-3xl">48</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">✓ 42 passed</span>
                    <span className="text-destructive">✗ 4 failed</span>
                    <span className="text-muted-foreground">⏳ 2 pending</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg. Processing Time</CardDescription>
                  <CardTitle className="text-3xl">4.2 min</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">↓ 12% faster than last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Resource Utilization</CardDescription>
                  <CardTitle className="text-3xl">67%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: "67%" }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { level: "error", msg: "Redshift load job failed — connection timeout", time: "30 min ago" },
                    { level: "warn", msg: "S3 bucket nearing storage limit (92%)", time: "2 hours ago" },
                    { level: "info", msg: "EMR cluster auto-scaled from 4 to 8 nodes", time: "3 hours ago" },
                    { level: "info", msg: "Glue crawler completed — 12 new tables detected", time: "5 hours ago" },
                  ].map((alert, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                      alert.level === "error" ? "border-destructive/30 bg-destructive/5" :
                      alert.level === "warn" ? "border-yellow-500/30 bg-yellow-500/5" :
                      "border-border bg-muted/30"
                    }`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        alert.level === "error" ? "bg-destructive" :
                        alert.level === "warn" ? "bg-yellow-500" :
                        "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.msg}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DataEngineeringDashboard;
