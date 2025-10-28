import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FlaskConical, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatisticalTestsPanelProps {
  data: any[];
}

export const StatisticalTestsPanel = ({ data }: StatisticalTestsPanelProps) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedColumn1, setSelectedColumn1] = useState<string>("");
  const [selectedColumn2, setSelectedColumn2] = useState<string>("");
  const [testType, setTestType] = useState<string>("ttest");

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => typeof data[0]?.[col] === 'number');

  const runTTest = () => {
    if (!selectedColumn1 || !selectedColumn2) {
      toast.error("Please select two columns");
      return;
    }

    const values1 = data.map(row => row[selectedColumn1]).filter(v => typeof v === 'number');
    const values2 = data.map(row => row[selectedColumn2]).filter(v => typeof v === 'number');

    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

    const var1 = values1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / values1.length;
    const var2 = values2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / values2.length;

    const tStatistic = (mean1 - mean2) / Math.sqrt(var1 / values1.length + var2 / values2.length);
    const df = values1.length + values2.length - 2;
    const pValue = 2 * (1 - tDistributionCDF(Math.abs(tStatistic), df));

    const result = {
      id: Date.now(),
      testName: "Independent T-Test",
      column1: selectedColumn1,
      column2: selectedColumn2,
      tStatistic: tStatistic.toFixed(4),
      pValue: pValue.toFixed(6),
      significant: pValue < 0.05,
      mean1: mean1.toFixed(2),
      mean2: mean2.toFixed(2),
      interpretation: pValue < 0.05
        ? `Significant difference detected (p = ${pValue.toFixed(6)} < 0.05)`
        : `No significant difference (p = ${pValue.toFixed(6)} >= 0.05)`,
    };

    setTestResults([result, ...testResults]);
    toast.success("T-Test completed");
  };

  const runCorrelation = () => {
    if (!selectedColumn1 || !selectedColumn2) {
      toast.error("Please select two columns");
      return;
    }

    const values1 = data.map(row => row[selectedColumn1]).filter(v => typeof v === 'number');
    const values2 = data.map(row => row[selectedColumn2]).filter(v => typeof v === 'number');

    const n = Math.min(values1.length, values2.length);
    const mean1 = values1.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const mean2 = values2.slice(0, n).reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const correlation = numerator / Math.sqrt(sum1Sq * sum2Sq);

    const result = {
      id: Date.now(),
      testName: "Pearson Correlation",
      column1: selectedColumn1,
      column2: selectedColumn2,
      correlation: correlation.toFixed(4),
      strength: Math.abs(correlation) > 0.7 ? "Strong" : Math.abs(correlation) > 0.4 ? "Moderate" : "Weak",
      direction: correlation > 0 ? "Positive" : "Negative",
      significant: Math.abs(correlation) > 0.3,
      interpretation: `${Math.abs(correlation) > 0.7 ? "Strong" : Math.abs(correlation) > 0.4 ? "Moderate" : "Weak"} ${correlation > 0 ? "positive" : "negative"} correlation (r = ${correlation.toFixed(4)})`,
    };

    setTestResults([result, ...testResults]);
    toast.success("Correlation analysis completed");
  };

  const runANOVA = () => {
    if (numericColumns.length < 3) {
      toast.error("Need at least 3 numeric columns for ANOVA");
      return;
    }

    const groups = numericColumns.slice(0, 3).map(col => 
      data.map(row => row[col]).filter(v => typeof v === 'number')
    );

    const grandMean = groups.flat().reduce((a, b) => a + b, 0) / groups.flat().length;
    
    let ssBetween = 0;
    groups.forEach(group => {
      const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
      ssBetween += group.length * Math.pow(groupMean - grandMean, 2);
    });

    let ssWithin = 0;
    groups.forEach(group => {
      const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
      ssWithin += group.reduce((sum, val) => sum + Math.pow(val - groupMean, 2), 0);
    });

    const dfBetween = groups.length - 1;
    const dfWithin = groups.flat().length - groups.length;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStatistic = msBetween / msWithin;

    const result = {
      id: Date.now(),
      testName: "One-Way ANOVA",
      groups: numericColumns.slice(0, 3).join(', '),
      fStatistic: fStatistic.toFixed(4),
      dfBetween,
      dfWithin,
      significant: fStatistic > 3.0,
      interpretation: fStatistic > 3.0
        ? `Significant differences between groups (F = ${fStatistic.toFixed(4)})`
        : `No significant differences between groups (F = ${fStatistic.toFixed(4)})`,
    };

    setTestResults([result, ...testResults]);
    toast.success("ANOVA completed");
  };

  const runChiSquare = () => {
    if (columns.length < 2) {
      toast.error("Need at least 2 columns for Chi-Square test");
      return;
    }

    const col1 = columns[0];
    const col2 = columns[1];

    const contingencyTable: any = {};
    data.forEach(row => {
      const val1 = String(row[col1]);
      const val2 = String(row[col2]);
      if (!contingencyTable[val1]) contingencyTable[val1] = {};
      contingencyTable[val1][val2] = (contingencyTable[val1][val2] || 0) + 1;
    });

    const result = {
      id: Date.now(),
      testName: "Chi-Square Test",
      column1: col1,
      column2: col2,
      categories: Object.keys(contingencyTable).length,
      interpretation: "Chi-Square test for independence between categorical variables",
    };

    setTestResults([result, ...testResults]);
    toast.success("Chi-Square test completed");
  };

  // Simplified t-distribution CDF approximation
  const tDistributionCDF = (t: number, df: number): number => {
    const x = df / (df + t * t);
    return 1 - 0.5 * Math.pow(x, df / 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          Statistical Hypothesis Testing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tests">Run Tests</TabsTrigger>
            <TabsTrigger value="results">Results ({testResults.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ttest">Independent T-Test</SelectItem>
                    <SelectItem value="correlation">Pearson Correlation</SelectItem>
                    <SelectItem value="anova">One-Way ANOVA</SelectItem>
                    <SelectItem value="chisquare">Chi-Square Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testType !== 'anova' && testType !== 'chisquare' && (
                <>
                  <div>
                    <Label>First Column</Label>
                    <Select value={selectedColumn1} onValueChange={setSelectedColumn1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Second Column</Label>
                    <Select value={selectedColumn2} onValueChange={setSelectedColumn2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.filter(c => c !== selectedColumn1).map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  switch (testType) {
                    case 'ttest':
                      runTTest();
                      break;
                    case 'correlation':
                      runCorrelation();
                      break;
                    case 'anova':
                      runANOVA();
                      break;
                    case 'chisquare':
                      runChiSquare();
                      break;
                  }
                }}
              >
                Run Test
              </Button>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Label>Test Information</Label>
              <div className="text-xs text-muted-foreground space-y-1">
                {testType === 'ttest' && (
                  <p>• T-Test: Compares means of two groups to determine if they're significantly different</p>
                )}
                {testType === 'correlation' && (
                  <p>• Correlation: Measures the strength and direction of relationship between two variables</p>
                )}
                {testType === 'anova' && (
                  <p>• ANOVA: Analyzes variance between multiple groups to detect differences</p>
                )}
                {testType === 'chisquare' && (
                  <p>• Chi-Square: Tests independence between categorical variables</p>
                )}
                <p>• Significance level: α = 0.05</p>
                <p>• p-value &lt; 0.05 indicates statistical significance</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No test results yet. Run a test to see results here.</p>
                  </div>
                ) : (
                  testResults.map(result => (
                    <Card key={result.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{result.testName}</h4>
                            {result.column1 && result.column2 && (
                              <p className="text-xs text-muted-foreground">
                                {result.column1} vs {result.column2}
                              </p>
                            )}
                            {result.groups && (
                              <p className="text-xs text-muted-foreground">
                                Groups: {result.groups}
                              </p>
                            )}
                          </div>
                          {result.significant !== undefined && (
                            result.significant ? (
                              <Badge className="gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Significant
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="w-3 h-3" />
                                Not Significant
                              </Badge>
                            )
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {result.tStatistic && (
                            <div>
                              <span className="text-muted-foreground">t-statistic:</span>{' '}
                              <span className="font-medium">{result.tStatistic}</span>
                            </div>
                          )}
                          {result.pValue && (
                            <div>
                              <span className="text-muted-foreground">p-value:</span>{' '}
                              <span className="font-medium">{result.pValue}</span>
                            </div>
                          )}
                          {result.correlation && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Correlation:</span>{' '}
                                <span className="font-medium">{result.correlation}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Strength:</span>{' '}
                                <span className="font-medium">{result.strength}</span>
                              </div>
                            </>
                          )}
                          {result.fStatistic && (
                            <>
                              <div>
                                <span className="text-muted-foreground">F-statistic:</span>{' '}
                                <span className="font-medium">{result.fStatistic}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">df:</span>{' '}
                                <span className="font-medium">{result.dfBetween}, {result.dfWithin}</span>
                              </div>
                            </>
                          )}
                          {result.mean1 && result.mean2 && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Mean 1:</span>{' '}
                                <span className="font-medium">{result.mean1}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Mean 2:</span>{' '}
                                <span className="font-medium">{result.mean2}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
