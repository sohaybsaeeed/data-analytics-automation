import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, TrendingUp, LogOut, Sparkles, Database, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { DetailedStatisticsDialog } from "@/components/DetailedStatisticsDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [dataset, setDataset] = useState<any[] | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [visualizations, setVisualizations] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [chartTypes, setChartTypes] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();
  
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let parsedData: any[] = [];
        let fields: string[] = [];

        if (fileExtension === 'csv') {
          // Parse CSV
          Papa.parse(e.target?.result as string, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              parsedData = results.data;
              fields = results.meta.fields || [];
              processUploadedData(file, parsedData, fields, 'csv');
            },
            error: (error) => {
              toast.error(`Parse error: ${error.message}`);
              setUploading(false);
            }
          });
        } else {
          // Parse Excel
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
          fields = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
          processUploadedData(file, parsedData, fields, 'excel');
        }
      } catch (error: any) {
        toast.error(`Parse error: ${error.message}`);
        setUploading(false);
      }
    };

    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const processUploadedData = async (file: File, data: any[], fields: string[], sourceType: string) => {
    try {
      setDataset(data);
      
      // Save dataset metadata to database
      const { error } = await supabase
        .from('datasets')
        .insert({
          user_id: user?.id,
          name: file.name,
          source_type: sourceType,
          row_count: data.length,
          column_count: fields.length,
          metadata: {
            fields: fields,
          },
        });

      if (error) throw error;

      toast.success(`Uploaded ${data.length} rows from ${sourceType.toUpperCase()}`);
      handleAnalyzeData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to save dataset");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeData = async (data: any[]) => {
    if (!data || data.length === 0) {
      toast.error("No data to analyze");
      return;
    }

    setAnalyzing(true);
    setProcessingStatus('Cleaning data...');
    
    try {
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-dataset', {
        body: { data: data.slice(0, 100) } // Send first 100 rows for analysis
      });

      if (error) throw error;

      if (analysisResult?.insights) {
        setInsights(analysisResult.insights);
        setStatistics(analysisResult.statistics);
        setVisualizations(analysisResult.visualizations || []);
        setDataQuality(analysisResult.dataQuality || null);
        setProcessingStatus('');
        
        // Initialize chart types with default values
        const initialChartTypes: { [key: number]: string } = {};
        analysisResult.visualizations?.forEach((viz: any, index: number) => {
          initialChartTypes[index] = viz.type;
        });
        setChartTypes(initialChartTypes);
        
        toast.success(`Data cleaned, clustered, and analyzed successfully. ${analysisResult.dataQuality?.finalRows || 0} valid rows processed.`);
      } else {
        toast.error("No insights generated");
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setProcessingStatus('');
      toast.error(error.message || "Failed to analyze data");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">InsightFlow</span>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Data Analysis Dashboard</h1>
          <p className="text-muted-foreground">Upload your data and get AI-powered insights instantly</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Data
              </CardTitle>
              <CardDescription>CSV, Excel, or connect to databases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload CSV or Excel"}
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              
              <Button variant="outline" className="w-full" disabled>
                <Database className="w-4 h-4 mr-2" />
                Connect Database (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {dataset && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Dataset Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-semibold">Rows:</span> {dataset.length}</p>
                    <p className="text-sm"><span className="font-semibold">Columns:</span> {Object.keys(dataset[0] || {}).length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleAnalyzeData(dataset)}
                    disabled={analyzing}
                    variant="hero"
                    className="w-full"
                  >
                    {analyzing ? (
                      <div className="flex flex-col items-center gap-1">
                        <span>Processing...</span>
                        {processingStatus && <span className="text-xs">{processingStatus}</span>}
                      </div>
                    ) : "Generate Insights"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {insights.length > 0 && (
          <Tabs defaultValue="quality" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quality">Data Quality</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quality" className="space-y-4">
              <h2 className="text-2xl font-bold">Data Quality Report</h2>
              {dataQuality && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preprocessing Summary</CardTitle>
                    <CardDescription>Data cleaning and validation results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Original Rows</p>
                        <p className="text-2xl font-bold">{dataQuality.originalRows}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Duplicates Removed</p>
                        <p className="text-2xl font-bold text-orange-600">{dataQuality.duplicatesRemoved}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Invalid Rows</p>
                        <p className="text-2xl font-bold text-red-600">{dataQuality.invalidRowsRemoved}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Final Valid Rows</p>
                        <p className="text-2xl font-bold text-green-600">{dataQuality.finalRows}</p>
                      </div>
                    </div>
                    
                    {Object.keys(dataQuality.missingValuesPerColumn || {}).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Missing Values by Column</h4>
                        <div className="space-y-2">
                          {Object.entries(dataQuality.missingValuesPerColumn).map(([col, info]: [string, any]) => (
                            <div key={col} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="font-medium">{col}</span>
                              <span className="text-sm">
                                {info.count} missing ({info.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <h2 className="text-2xl font-bold">AI-Generated Insights</h2>
              {insights.map((insight, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xs uppercase bg-primary/10 text-primary px-2 py-1 rounded">
                        {insight.type}
                      </span>
                      {insight.title}
                    </CardTitle>
                    <CardDescription>
                      Confidence: {(insight.confidence_score * 100).toFixed(0)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="visualizations" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Data Visualizations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Switch between different chart types to explore your data from multiple perspectives
              </p>
              {visualizations.map((viz, index) => {
                const currentChartType = chartTypes[index] || viz.type;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            {viz.title}
                          </CardTitle>
                          <CardDescription>{viz.description}</CardDescription>
                        </div>
                        {viz.availableTypes && viz.availableTypes.length > 1 && (
                          <Select 
                            value={currentChartType} 
                            onValueChange={(value) => setChartTypes(prev => ({ ...prev, [index]: value }))}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Chart Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {viz.availableTypes.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentChartType === 'bar' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={viz.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={viz.xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={viz.yAxis} fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                      {currentChartType === 'line' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={viz.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={viz.xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey={viz.yAxis} stroke="hsl(var(--primary))" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      {currentChartType === 'area' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={viz.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={viz.xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey={viz.yAxis} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                      {currentChartType === 'pie' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={viz.data}
                              dataKey={viz.yAxis}
                              nameKey={viz.xAxis}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label
                            >
                              {viz.data.map((_: any, i: number) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      {currentChartType === 'scatter' && (
                        <ResponsiveContainer width="100%" height={300}>
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={viz.xAxis} name={viz.xAxis} />
                            <YAxis dataKey={viz.yAxis} name={viz.yAxis} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name={viz.title} data={viz.data} fill="hsl(var(--primary))" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Statistical Analysis</h2>
              {statistics && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Statistics Overview</CardTitle>
                      <CardDescription>Summary of important statistical measures</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {statistics.descriptive && Object.entries(statistics.descriptive).slice(0, 3).map(([column, stats]: [string, any]) => (
                        <div key={column} className="border-l-4 border-l-primary pl-4 py-2">
                          <h4 className="font-semibold mb-2">{column}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Mean:</span>
                              <p className="text-lg font-medium">{stats.mean?.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Median:</span>
                              <p className="text-lg font-medium">{stats.median?.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Std Dev:</span>
                              <p className="text-lg font-medium">{stats.stdDev?.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <DetailedStatisticsDialog statistics={statistics} />
                    </CardContent>
                  </Card>
                  
                  {(statistics.linearRegression && statistics.linearRegression.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Linear Regression Models</CardTitle>
                        <CardDescription>Predictive relationships between variables</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statistics.linearRegression.map((reg: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{reg.xColumn} → {reg.yColumn}</h4>
                                <span className="text-sm text-muted-foreground">R² = {reg.rSquared?.toFixed(3)}</span>
                              </div>
                              <p className="text-xs font-mono bg-muted p-2 rounded">{reg.equation}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {statistics.logisticRegression && statistics.logisticRegression.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Logistic Regression Models</CardTitle>
                        <CardDescription>Binary classification predictions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statistics.logisticRegression.map((reg: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{reg.featureColumn} → {reg.targetColumn}</h4>
                                <span className="text-sm font-medium text-green-600">{(reg.accuracy * 100).toFixed(1)}% Accuracy</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{reg.interpretation}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {statistics.clustering && Object.keys(statistics.clustering).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Clustering Analysis</CardTitle>
                        <CardDescription>{statistics.clustering.method} with {statistics.clustering.k} clusters</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(statistics.clustering.clusters || {}).map(([cluster, count]: [string, any]) => (
                            <div key={cluster} className="p-3 bg-muted rounded text-center">
                              <p className="text-sm text-muted-foreground">Cluster {parseInt(cluster) + 1}</p>
                              <p className="text-xl font-bold">{count}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
