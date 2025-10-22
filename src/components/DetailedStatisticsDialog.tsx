import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface DetailedStatisticsDialogProps {
  statistics: any;
}

export const DetailedStatisticsDialog = ({ statistics }: DetailedStatisticsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          View Detailed Statistics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detailed Statistical Analysis</DialogTitle>
          <DialogDescription>Comprehensive statistics for all columns</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
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

            {/* Linear Regression */}
            {statistics?.linearRegression && statistics.linearRegression.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Linear Regression Models</h3>
                <div className="space-y-4">
                  {statistics.linearRegression.map((reg: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-semibold mb-2">{reg.xColumn} → {reg.yColumn}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Slope (β₁):</span> <span className="font-medium">{reg.slope?.toFixed(6)}</span></div>
                        <div><span className="text-muted-foreground">Intercept (β₀):</span> <span className="font-medium">{reg.intercept?.toFixed(6)}</span></div>
                        <div><span className="text-muted-foreground">R² (Coefficient of Determination):</span> <span className="font-medium">{reg.rSquared?.toFixed(6)}</span></div>
                        <div><span className="text-muted-foreground">Correlation (r):</span> <span className="font-medium">{reg.correlation?.toFixed(6)}</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-mono bg-background p-2 rounded">{reg.equation}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Model explains {(reg.rSquared * 100).toFixed(2)}% of variance in {reg.yColumn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logistic Regression */}
            {statistics?.logisticRegression && statistics.logisticRegression.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Logistic Regression Models</h3>
                <div className="space-y-4">
                  {statistics.logisticRegression.map((reg: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-semibold mb-2">{reg.featureColumn} → {reg.targetColumn}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Weight (w):</span> <span className="font-medium">{reg.weight?.toFixed(6)}</span></div>
                        <div><span className="text-muted-foreground">Bias (b):</span> <span className="font-medium">{reg.bias?.toFixed(6)}</span></div>
                        <div><span className="text-muted-foreground">Accuracy:</span> <span className="font-medium text-green-600">{(reg.accuracy * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">Classes:</span> <span className="font-medium">{reg.classes?.join(' vs ')}</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">{reg.interpretation}</p>
                        <p className="text-xs font-mono bg-background p-2 rounded mt-2">
                          P(y=1) = 1 / (1 + e^-(wx + b))
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
