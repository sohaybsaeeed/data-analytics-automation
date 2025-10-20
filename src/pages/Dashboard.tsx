import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import { Upload, TrendingUp, LogOut, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [dataset, setDataset] = useState<any[] | null>(null);
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

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setUploading(true);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setDataset(results.data);
          
          // Save dataset metadata to database
          const { error } = await supabase
            .from('datasets')
            .insert({
              user_id: user?.id,
              name: file.name,
              source_type: 'csv',
              row_count: results.data.length,
              column_count: results.meta.fields?.length || 0,
              metadata: {
                fields: results.meta.fields,
              },
            });

          if (error) throw error;

          toast.success(`Uploaded ${results.data.length} rows`);
          handleAnalyzeData(results.data);
        } catch (error: any) {
          toast.error(error.message || "Failed to save dataset");
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        toast.error(`Parse error: ${error.message}`);
        setUploading(false);
      }
    });
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
            <CardContent>
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload CSV"}
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
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
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">AI-Generated Insights</h2>
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;
