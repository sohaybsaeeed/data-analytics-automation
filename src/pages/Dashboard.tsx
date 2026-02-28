import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, TrendingUp, LogOut, Sparkles, Database, BarChart3, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { DetailedStatisticsDialog } from "@/components/DetailedStatisticsDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataOrganizationDialog from "@/components/DataOrganizationDialog";
import ManualDataOrganizer from "@/components/ManualDataOrganizer";
import ManualOrganizationMethod from "@/components/ManualOrganizationMethod";
import SQLDataOrganizer from "@/components/SQLDataOrganizer";
import PythonDataOrganizer from "@/components/PythonDataOrganizer";
import ExcelDataOrganizer from "@/components/ExcelDataOrganizer";
import { AdvancedVisualizationPanel } from "@/components/AdvancedVisualizationPanel";
import { DataEditorPanel } from "@/components/DataEditorPanel";
import { CustomCalculationsPanel } from "@/components/CustomCalculationsPanel";
import { DAXAnalysisPanel } from "@/components/DAXAnalysisPanel";
import { PivotTablePanel } from "@/components/PivotTablePanel";
import { StatisticalTestsPanel } from "@/components/StatisticalTestsPanel";
import { DashboardRecommendations } from "@/components/DashboardRecommendations";
import { ConnectDatabaseDialog } from "@/components/ConnectDatabaseDialog";
import { downloadCSV, downloadJSON, downloadInsightsReport } from "@/lib/downloadHelpers";
import { Download } from "lucide-react";

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
  const [showOrganizationDialog, setShowOrganizationDialog] = useState(false);
  const [showManualOrganizer, setShowManualOrganizer] = useState(false);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [organizationMethod, setOrganizationMethod] = useState<'sql' | 'python' | 'excel' | 'manual' | null>(null);
  const [pendingData, setPendingData] = useState<{ file: File; data: any[]; fields: string[]; sourceType: string } | null>(null);
  const [showDatabaseDialog, setShowDatabaseDialog] = useState(false);
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
      
      // Store data and show organization dialog
      setPendingData({ file, data, fields, sourceType });
      setShowOrganizationDialog(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to save dataset");
    } finally {
      setUploading(false);
    }
  };

  const handleOrganizationChoice = (choice: 'ai' | 'manual') => {
    setShowOrganizationDialog(false);
    
    if (choice === 'ai') {
      if (pendingData) {
        toast.info("AI will automatically organize and analyze your data");
        handleAnalyzeData(pendingData.data);
        setPendingData(null);
      }
    } else {
      setShowMethodDialog(true);
    }
  };

  const handleMethodChoice = (method: 'sql' | 'python' | 'excel') => {
    setShowMethodDialog(false);
    setOrganizationMethod(method);
  };

  const handleManualOrganizationConfirm = (organizedData: any[], selectedColumns?: string[]) => {
    setShowManualOrganizer(false);
    setOrganizationMethod(null);
    setDataset(organizedData);
    toast.success(`Data organized: ${selectedColumns ? selectedColumns.length + ' columns selected' : organizedData.length + ' rows'}`);
    handleAnalyzeData(organizedData);
    setPendingData(null);
  };

  const handleDatabaseImport = (data: any[], fields: string[]) => {
    console.log('Database import complete:', data.length, 'rows');
    setDataset(data);
    toast.success(`Successfully imported ${data.length} rows from database`);
    handleAnalyzeData(data);
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
              <span className="text-xl font-bold">Data Analytics Automation</span>
            </div>
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={() => navigate("/data-engineering")}>
                 <Database className="w-4 h-4 mr-2" />
                 Data Engineering
               </Button>
               <Button variant="ghost" onClick={handleSignOut}>
                 <LogOut className="w-4 h-4 mr-2" />
                 Sign Out
               </Button>
             </div>
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
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowDatabaseDialog(true)}
              >
                <Database className="w-4 h-4 mr-2" />
                Connect Database
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
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Viz</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
              <TabsTrigger value="dax">DAX</TabsTrigger>
              <TabsTrigger value="pivot">Pivot Table</TabsTrigger>
              <TabsTrigger value="stats-tests">Stats Tests</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quality" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Data Quality Report</h2>
                <Button
                  onClick={() => {
                    if (dataQuality) {
                      const qualityData = [
                        { Metric: 'Original Rows', Value: dataQuality.originalRows },
                        { Metric: 'Duplicates Removed', Value: dataQuality.duplicatesRemoved },
                        { Metric: 'Invalid Rows Removed', Value: dataQuality.invalidRowsRemoved },
                        { Metric: 'Final Valid Rows', Value: dataQuality.finalRows }
                      ];
                      downloadCSV(qualityData, 'data-quality-report.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">AI-Generated Insights</h2>
                <Button
                  onClick={() => downloadInsightsReport(insights, statistics, dataQuality, visualizations)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Insights
                </Button>
              </div>
              
              <DashboardRecommendations 
                data={dataset || []} 
                insights={insights} 
                statistics={statistics} 
              />
              
              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Detailed Insights</h3>
                <div className="space-y-4">
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualizations" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Data Visualizations</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Switch between different chart types to explore your data from multiple perspectives
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const vizData = visualizations.map(viz => ({
                      Title: viz.title,
                      Type: viz.type,
                      Description: viz.description,
                      DataPoints: viz.data?.length || 0
                    }));
                    downloadCSV(vizData, 'visualizations-summary.csv');
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Statistical Analysis</h2>
                <Button
                  onClick={() => {
                    if (statistics) {
                      downloadJSON(statistics, 'statistical-analysis.json');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
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
                      <DetailedStatisticsDialog statistics={statistics} data={dataset || []} />
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

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Advanced Visualizations</h2>
                  <p className="text-muted-foreground mt-1">
                    Power BI & Tableau-like visualization controls with filtering, drill-down, and custom styling
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (dataset) {
                      downloadCSV(dataset, 'dataset-for-advanced-viz.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
              </div>
              {dataset && (
                <AdvancedVisualizationPanel 
                  data={dataset} 
                  insights={insights}
                  onDataEdit={(newData) => setDataset(newData)}
                />
              )}
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Data Editor</h2>
                  <p className="text-muted-foreground mt-1">
                    Edit data directly in the dashboard with bulk operations and sorting
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (dataset) {
                      downloadCSV(dataset, 'edited-data.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
              </div>
              {dataset && (
                <DataEditorPanel 
                  data={dataset}
                  onDataUpdate={(newData) => {
                    setDataset(newData);
                    // Auto-analyze the updated data
                    toast.success("Data updated! Regenerating analytics...");
                    setTimeout(() => {
                      handleAnalyzeData(newData);
                    }, 500);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="calculations" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Custom Calculations</h2>
                  <p className="text-muted-foreground mt-1">
                    Create custom measures, aggregations, and calculated fields
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (dataset) {
                      downloadCSV(dataset, 'calculations-data.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
              </div>
              {dataset && (
                <CustomCalculationsPanel 
                  data={dataset}
                  onCalculationApplied={(data, calcName) => {
                    console.log(`Applied calculation: ${calcName}`);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="dax" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">DAX Analysis & Measures</h2>
                  <p className="text-muted-foreground mt-1">
                    Create Power BI-style DAX measures with time intelligence, aggregations, and advanced formulas
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (dataset) {
                      downloadCSV(dataset, 'dax-analysis-data.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
              </div>
              {dataset && (
                <DAXAnalysisPanel 
                  data={dataset}
                  onMeasureCreated={(measure) => {
                    console.log('Measure created:', measure);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="pivot" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Pivot Table Analysis</h2>
                  <p className="text-muted-foreground mt-1">
                    Create Excel-style pivot tables with dynamic rows, columns, and aggregations
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (dataset) {
                      downloadCSV(dataset, 'pivot-table-data.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
              </div>
              {dataset && (
                <PivotTablePanel data={dataset} />
              )}
            </TabsContent>

            <TabsContent value="stats-tests" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Statistical Hypothesis Testing</h2>
                  <p className="text-muted-foreground mt-1">
                    Run T-Tests, ANOVA, Correlation, and Chi-Square tests to validate hypotheses
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (dataset) {
                      downloadCSV(dataset, 'stats-test-data.csv');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
              </div>
              {dataset && (
                <StatisticalTestsPanel data={dataset} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <DataOrganizationDialog 
        open={showOrganizationDialog} 
        onChoice={handleOrganizationChoice} 
      />
      
      <ManualOrganizationMethod
        open={showMethodDialog}
        onChoice={handleMethodChoice}
      />
      
      <ConnectDatabaseDialog
        open={showDatabaseDialog}
        onOpenChange={setShowDatabaseDialog}
        onDataImported={handleDatabaseImport}
      />
      
      {organizationMethod && pendingData && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          {organizationMethod === 'sql' && (
            <SQLDataOrganizer data={pendingData.data} onConfirm={handleManualOrganizationConfirm} />
          )}
          {organizationMethod === 'python' && (
            <PythonDataOrganizer data={pendingData.data} fileName={pendingData.file.name} onConfirm={handleManualOrganizationConfirm} />
          )}
          {organizationMethod === 'excel' && (
            <ExcelDataOrganizer data={pendingData.data} fileName={pendingData.file.name} onConfirm={handleManualOrganizationConfirm} />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
