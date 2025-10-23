import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from "recharts";
import { Card } from "@/components/ui/card";

interface DetailedStatisticsDialogProps {
  statistics: any;
  data?: any[];
}

export const DetailedStatisticsDialog = ({ statistics, data }: DetailedStatisticsDialogProps) => {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          View Detailed Statistics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detailed Statistical Analysis with Visualizations</DialogTitle>
          <DialogDescription>Comprehensive statistics and visual representations</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Descriptive Statistics */}
            {statistics?.descriptive && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Descriptive Statistics</h3>
                <div className="space-y-4">
                  {Object.entries(statistics.descriptive).map(([column, stats]: [string, any]) => (
                    <div key={column} className="space-y-2 border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-semibold text-base">{column}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Mean:</span> <span className="font-medium">{stats.mean?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Median:</span> <span className="font-medium">{stats.median?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Std Dev:</span> <span className="font-medium">{stats.stdDev?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Variance:</span> <span className="font-medium">{(stats.stdDev * stats.stdDev)?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Min:</span> <span className="font-medium">{stats.min?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Max:</span> <span className="font-medium">{stats.max?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Range:</span> <span className="font-medium">{(stats.max - stats.min)?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Count:</span> <span className="font-medium">{stats.count}</span></div>
                        <div><span className="text-muted-foreground">Q1 (25%):</span> <span className="font-medium">{stats.q1?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Q2 (50%):</span> <span className="font-medium">{stats.median?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Q3 (75%):</span> <span className="font-medium">{stats.q3?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">IQR:</span> <span className="font-medium">{stats.iqr?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Outliers:</span> <span className="font-medium text-orange-600">{stats.outlierCount}</span></div>
                        <div><span className="text-muted-foreground">Outlier %:</span> <span className="font-medium">{((stats.outlierCount / stats.count) * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">Skewness:</span> <span className="font-medium">{stats.skewness?.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Kurtosis:</span> <span className="font-medium">{stats.kurtosis?.toFixed(4)}</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {stats.skewness > 0.5 && "Right-skewed distribution (tail on right side)"}
                          {stats.skewness < -0.5 && "Left-skewed distribution (tail on left side)"}
                          {stats.skewness >= -0.5 && stats.skewness <= 0.5 && "Approximately symmetric distribution"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.kurtosis > 3 && "Heavy-tailed distribution (more outliers than normal)"}
                          {stats.kurtosis < 3 && stats.kurtosis > 0 && "Light-tailed distribution (fewer outliers than normal)"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linear Regression with Visualization */}
            {statistics?.linearRegression && statistics.linearRegression.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Linear Regression Models</h3>
                <div className="space-y-6">
                  {statistics.linearRegression.map((reg: any, index: number) => {
                    const scatterData = data?.slice(0, 100).map(row => ({
                      x: row[reg.xColumn],
                      y: row[reg.yColumn],
                      predicted: reg.slope * row[reg.xColumn] + reg.intercept
                    })).filter(p => p.x !== null && p.y !== null) || [];
                    
                    return (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold mb-3">{reg.xColumn} → {reg.yColumn}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div><span className="text-muted-foreground">Slope (β₁):</span> <span className="font-medium">{reg.slope?.toFixed(6)}</span></div>
                          <div><span className="text-muted-foreground">Intercept (β₀):</span> <span className="font-medium">{reg.intercept?.toFixed(6)}</span></div>
                          <div><span className="text-muted-foreground">R² (Coefficient of Determination):</span> <span className="font-medium">{reg.rSquared?.toFixed(6)}</span></div>
                          <div><span className="text-muted-foreground">Correlation (r):</span> <span className="font-medium">{reg.correlation?.toFixed(6)}</span></div>
                        </div>
                        <div className="mb-3 pb-3 border-b">
                          <p className="text-xs font-mono bg-muted p-2 rounded">{reg.equation}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Model explains {(reg.rSquared * 100).toFixed(2)}% of variance in {reg.yColumn}
                          </p>
                        </div>
                        {scatterData.length > 0 && (
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={scatterData.sort((a, b) => a.x - b.x)} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="x" name={reg.xColumn} />
                              <YAxis name={reg.yColumn} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              <Scatter name="Actual Data" dataKey="y" fill={COLORS[0]} />
                              <Line type="monotone" dataKey="predicted" stroke={COLORS[1]} strokeWidth={2} dot={false} name="Regression Line" />
                            </ComposedChart>
                          </ResponsiveContainer>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Logistic Regression with Visualization */}
            {statistics?.logisticRegression && statistics.logisticRegression.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Logistic Regression Models</h3>
                <div className="space-y-6">
                  {statistics.logisticRegression.map((reg: any, index: number) => {
                    const classData = data?.slice(0, 100).map(row => ({
                      x: row[reg.featureColumn],
                      class: row[reg.targetColumn]
                    })).filter(p => p.x !== null && p.class !== null) || [];
                    
                    return (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold mb-3">{reg.featureColumn} → {reg.targetColumn}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div><span className="text-muted-foreground">Weight (w):</span> <span className="font-medium">{reg.weight?.toFixed(6)}</span></div>
                          <div><span className="text-muted-foreground">Bias (b):</span> <span className="font-medium">{reg.bias?.toFixed(6)}</span></div>
                          <div><span className="text-muted-foreground">Accuracy:</span> <span className="font-medium text-green-600">{(reg.accuracy * 100).toFixed(2)}%</span></div>
                          <div><span className="text-muted-foreground">Classes:</span> <span className="font-medium">{reg.classes?.join(' vs ')}</span></div>
                        </div>
                        <div className="mb-3 pb-3 border-b">
                          <p className="text-xs text-muted-foreground">{reg.interpretation}</p>
                          <p className="text-xs font-mono bg-muted p-2 rounded mt-2">
                            P(y=1) = 1 / (1 + e^-(wx + b))
                          </p>
                        </div>
                        {classData.length > 0 && (
                          <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="x" name={reg.featureColumn} />
                              <YAxis />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              {reg.classes?.map((cls: string, idx: number) => (
                                <Scatter
                                  key={cls}
                                  name={cls}
                                  data={classData.filter(d => d.class === cls).map(d => ({ x: d.x, y: idx }))}
                                  fill={COLORS[idx % COLORS.length]}
                                />
                              ))}
                            </ScatterChart>
                          </ResponsiveContainer>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Clustering Analysis with Visualization */}
            {statistics?.clustering && statistics.clustering.k && data && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Clustering Analysis</h3>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Method:</span> <span className="font-medium">{statistics.clustering.method}</span></div>
                      <div><span className="text-muted-foreground">Clusters (k):</span> <span className="font-medium">{statistics.clustering.k}</span></div>
                      <div><span className="text-muted-foreground">Total Points:</span> <span className="font-medium">{String(Object.values(statistics.clustering.clusters).reduce((a: number, b) => a + Number(b), 0))}</span></div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Cluster Distribution:</h5>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(statistics.clustering.clusters).map(([cluster, count]: [string, any]) => (
                          <div key={cluster} className="bg-muted rounded p-2 text-sm">
                            <span className="font-medium">Cluster {cluster}:</span> {count} points
                          </div>
                        ))}
                      </div>
                    </div>
                    {data.length > 0 && Object.keys(data[0]).filter(k => typeof data[0][k] === 'number').length >= 2 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Cluster Visualization:</h5>
                        <ResponsiveContainer width="100%" height={350}>
                          <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" name="Feature 1" />
                            <YAxis dataKey="y" name="Feature 2" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            {Array.from({ length: statistics.clustering.k }, (_, i) => {
                              const numericCols = Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
                              const clusterData = data.filter(row => row.cluster === i).slice(0, 50).map(row => ({
                                x: row[numericCols[0]],
                                y: row[numericCols[1]]
                              }));
                              return (
                                <Scatter
                                  key={i}
                                  name={`Cluster ${i}`}
                                  data={clusterData}
                                  fill={COLORS[i % COLORS.length]}
                                />
                              );
                            })}
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
