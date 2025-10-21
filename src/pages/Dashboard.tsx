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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [dataset, setDataset] = useState<any[] | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [visualizations, setVisualizations] = useState<any[]>([]);
  const navigate = useNavigate();

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
    try {
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-dataset', {
        body: { data: data.slice(0, 100) } // Send first 100 rows for analysis
      });

      if (error) throw error;

      if (analysisResult?.insights) {
        setInsights(analysisResult.insights);
        setStatistics(analysisResult.statistics);
        setVisualizations(analysisResult.visualizations || []);
        toast.success(`Generated ${analysisResult.insights.length} insights`);
      } else {
        toast.error("No insights generated");
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
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
                    {analyzing ? "Analyzing..." : "Generate Insights"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {insights.length > 0 && (
          <Tabs defaultValue="insights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

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
              {visualizations.map((viz, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {viz.title}
                    </CardTitle>
                    <CardDescription>{viz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {viz.type === 'bar' && (
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
                    {viz.type === 'line' && (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={viz.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={viz.xAxis} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey={viz.yAxis} stroke="hsl(var(--primary))" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                    {viz.type === 'scatter' && (
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
              ))}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Statistical Analysis</h2>
              {statistics && (
                <>
                  {statistics.descriptive && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Descriptive Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(statistics.descriptive).map(([column, stats]: [string, any]) => (
                            <Card key={column}>
                              <CardHeader>
                                <CardTitle className="text-base">{column}</CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm space-y-1">
                                <p><span className="font-semibold">Mean:</span> {stats.mean?.toFixed(2)}</p>
                                <p><span className="font-semibold">Median:</span> {stats.median?.toFixed(2)}</p>
                                <p><span className="font-semibold">Std Dev:</span> {stats.stdDev?.toFixed(2)}</p>
                                <p><span className="font-semibold">Min:</span> {stats.min?.toFixed(2)}</p>
                                <p><span className="font-semibold">Max:</span> {stats.max?.toFixed(2)}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {statistics.regression && statistics.regression.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Regression Analysis</CardTitle>
                        <CardDescription>Linear regression between numeric variables</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {statistics.regression.map((reg: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-semibold mb-2">{reg.xColumn} vs {reg.yColumn}</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="font-semibold">Slope:</span> {reg.slope?.toFixed(4)}</p>
                                <p><span className="font-semibold">Intercept:</span> {reg.intercept?.toFixed(4)}</p>
                                <p><span className="font-semibold">R²:</span> {reg.rSquared?.toFixed(4)}</p>
                                <p><span className="font-semibold">Correlation:</span> {reg.correlation?.toFixed(4)}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Equation: y = {reg.slope?.toFixed(4)}x + {reg.intercept?.toFixed(4)}
                              </p>
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
