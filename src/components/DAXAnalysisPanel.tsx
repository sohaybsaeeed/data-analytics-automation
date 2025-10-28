import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calculator, TrendingUp, Calendar, Plus, Play, Trash2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DAXAnalysisPanelProps {
  data: any[];
  onMeasureCreated: (measure: any) => void;
}

export const DAXAnalysisPanel = ({ data, onMeasureCreated }: DAXAnalysisPanelProps) => {
  const [measures, setMeasures] = useState<any[]>([]);
  const [calculatedColumns, setCalculatedColumns] = useState<any[]>([]);
  const [measureName, setMeasureName] = useState("");
  const [daxFormula, setDaxFormula] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("aggregation");

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => typeof data[0]?.[col] === 'number');
  const dateColumns = columns.filter(col => {
    const val = data[0]?.[col];
    return typeof val === 'string' && !isNaN(Date.parse(val));
  });

  // DAX Function Templates
  const daxFunctions = {
    aggregation: [
      { name: 'SUM', formula: 'SUM([Column])', description: 'Sum of all values' },
      { name: 'AVERAGE', formula: 'AVERAGE([Column])', description: 'Average of values' },
      { name: 'COUNT', formula: 'COUNT([Column])', description: 'Count of non-blank values' },
      { name: 'COUNTROWS', formula: 'COUNTROWS(Table)', description: 'Count of rows' },
      { name: 'MIN', formula: 'MIN([Column])', description: 'Minimum value' },
      { name: 'MAX', formula: 'MAX([Column])', description: 'Maximum value' },
      { name: 'DISTINCTCOUNT', formula: 'DISTINCTCOUNT([Column])', description: 'Count distinct values' },
    ],
    timeIntelligence: [
      { name: 'TOTALYTD', formula: 'TOTALYTD(SUM([Sales]), [Date])', description: 'Year-to-date total' },
      { name: 'TOTALMTD', formula: 'TOTALMTD(SUM([Sales]), [Date])', description: 'Month-to-date total' },
      { name: 'TOTALQTD', formula: 'TOTALQTD(SUM([Sales]), [Date])', description: 'Quarter-to-date total' },
      { name: 'SAMEPERIODLASTYEAR', formula: 'CALCULATE(SUM([Sales]), SAMEPERIODLASTYEAR([Date]))', description: 'Same period last year' },
      { name: 'PREVIOUSMONTH', formula: 'CALCULATE(SUM([Sales]), PREVIOUSMONTH([Date]))', description: 'Previous month value' },
      { name: 'DATEADD', formula: 'CALCULATE(SUM([Sales]), DATEADD([Date], -1, YEAR))', description: 'Shift time period' },
      { name: 'DATESYTD', formula: 'DATESYTD([Date])', description: 'Dates year-to-date' },
    ],
    filter: [
      { name: 'CALCULATE', formula: 'CALCULATE(SUM([Sales]), [Region] = "East")', description: 'Modify filter context' },
      { name: 'FILTER', formula: 'FILTER(Table, [Column] > 100)', description: 'Filter table rows' },
      { name: 'ALL', formula: 'CALCULATE(SUM([Sales]), ALL(Table))', description: 'Remove filters' },
      { name: 'ALLEXCEPT', formula: 'CALCULATE(SUM([Sales]), ALLEXCEPT(Table, [Column]))', description: 'Remove all filters except' },
      { name: 'RELATED', formula: 'RELATED(RelatedTable[Column])', description: 'Get related value' },
      { name: 'RELATEDTABLE', formula: 'COUNTROWS(RELATEDTABLE(Table))', description: 'Get related table' },
    ],
    statistical: [
      { name: 'STDEV.P', formula: 'STDEV.P([Column])', description: 'Population standard deviation' },
      { name: 'STDEV.S', formula: 'STDEV.S([Column])', description: 'Sample standard deviation' },
      { name: 'VAR.P', formula: 'VAR.P([Column])', description: 'Population variance' },
      { name: 'VAR.S', formula: 'VAR.S([Column])', description: 'Sample variance' },
      { name: 'MEDIAN', formula: 'MEDIAN([Column])', description: 'Median value' },
      { name: 'PERCENTILE.INC', formula: 'PERCENTILE.INC([Column], 0.75)', description: 'Percentile value' },
    ],
    logical: [
      { name: 'IF', formula: 'IF([Value] > 100, "High", "Low")', description: 'Conditional logic' },
      { name: 'SWITCH', formula: 'SWITCH([Category], "A", 1, "B", 2, 0)', description: 'Multiple conditions' },
      { name: 'AND', formula: 'AND([Value1] > 0, [Value2] < 100)', description: 'Logical AND' },
      { name: 'OR', formula: 'OR([Value1] > 100, [Value2] > 100)', description: 'Logical OR' },
      { name: 'NOT', formula: 'NOT([IsActive])', description: 'Logical NOT' },
    ],
  };

  const createMeasure = () => {
    if (!measureName || !daxFormula) {
      toast.error("Please provide a name and formula");
      return;
    }

    try {
      // Simple DAX formula execution (limited implementation)
      const result = executeDaxFormula(daxFormula);
      
      const measure = {
        id: Date.now(),
        name: measureName,
        formula: daxFormula,
        category: selectedCategory,
        result: result,
        createdAt: new Date().toISOString(),
      };

      setMeasures([...measures, measure]);
      onMeasureCreated(measure);
      toast.success(`Measure "${measureName}" created with result: ${result}`);
      setMeasureName("");
      setDaxFormula("");
    } catch (error) {
      toast.error("Invalid DAX formula: " + (error as Error).message);
    }
  };

  const executeDaxFormula = (formula: string): number => {
    // Simplified DAX execution - supports basic functions
    const upperFormula = formula.toUpperCase();
    
    // Extract column name from formula
    const columnMatch = formula.match(/\[([^\]]+)\]/);
    if (!columnMatch) {
      throw new Error("Column reference not found");
    }
    
    const column = columnMatch[1];
    const values = data.map(row => row[column]).filter(v => typeof v === 'number');
    
    if (values.length === 0) {
      throw new Error("No numeric values found");
    }

    if (upperFormula.includes('SUM')) {
      return values.reduce((a, b) => a + b, 0);
    } else if (upperFormula.includes('AVERAGE')) {
      return values.reduce((a, b) => a + b, 0) / values.length;
    } else if (upperFormula.includes('COUNT')) {
      return values.length;
    } else if (upperFormula.includes('MIN')) {
      return Math.min(...values);
    } else if (upperFormula.includes('MAX')) {
      return Math.max(...values);
    } else if (upperFormula.includes('STDEV')) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
      return Math.sqrt(variance);
    } else {
      throw new Error("Unsupported DAX function");
    }
  };

  const insertFunction = (functionTemplate: string) => {
    setDaxFormula(daxFormula + functionTemplate);
  };

  const deleteMeasure = (id: number) => {
    setMeasures(measures.filter(m => m.id !== id));
    toast.success("Measure deleted");
  };

  const quickMeasures = [
    { name: 'Total Sales', formula: `SUM([${numericColumns[0] || 'value'}])`, icon: '∑' },
    { name: 'Average', formula: `AVERAGE([${numericColumns[0] || 'value'}])`, icon: 'x̄' },
    { name: 'Year-to-Date', formula: `TOTALYTD(SUM([${numericColumns[0] || 'value'}]), [${dateColumns[0] || 'date'}])`, icon: '📅' },
    { name: 'Growth %', formula: `DIVIDE(SUM([${numericColumns[0] || 'value'}]) - CALCULATE(SUM([${numericColumns[0] || 'value'}]), PREVIOUSYEAR([${dateColumns[0] || 'date'}])), CALCULATE(SUM([${numericColumns[0] || 'value'}]), PREVIOUSYEAR([${dateColumns[0] || 'date'}])))`, icon: '📈' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          DAX Analysis & Measures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="measures" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="measures">Measures</TabsTrigger>
            <TabsTrigger value="functions">DAX Functions</TabsTrigger>
            <TabsTrigger value="quick">Quick Measures</TabsTrigger>
          </TabsList>

          <TabsContent value="measures" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Measure Name</Label>
                <Input
                  placeholder="e.g., Total Sales, Profit Margin"
                  value={measureName}
                  onChange={(e) => setMeasureName(e.target.value)}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aggregation">Aggregation</SelectItem>
                    <SelectItem value="timeIntelligence">Time Intelligence</SelectItem>
                    <SelectItem value="statistical">Statistical</SelectItem>
                    <SelectItem value="filter">Filter & Context</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>DAX Formula</Label>
                <Textarea
                  placeholder="e.g., SUM([Sales]) or TOTALYTD(SUM([Revenue]), [Date])"
                  value={daxFormula}
                  onChange={(e) => setDaxFormula(e.target.value)}
                  className="font-mono text-sm"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use [ColumnName] to reference columns. Available: {numericColumns.join(', ')}
                </p>
              </div>

              <Button onClick={createMeasure} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Measure
              </Button>
            </div>

            {measures.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Created Measures ({measures.length})</Label>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-4">
                    {measures.map(measure => (
                      <div
                        key={measure.id}
                        className="p-3 bg-muted rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{measure.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {measure.category}
                              </Badge>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                              {measure.formula}
                            </p>
                            <p className="text-sm font-medium text-primary mt-2">
                              Result: {typeof measure.result === 'number' ? measure.result.toFixed(2) : measure.result}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMeasure(measure.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="functions" className="space-y-4">
            <Tabs defaultValue="aggregation">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="aggregation">Aggregation</TabsTrigger>
                <TabsTrigger value="timeIntelligence">Time Intelligence</TabsTrigger>
              </TabsList>

              {Object.entries(daxFunctions).slice(0, 2).map(([category, functions]) => (
                <TabsContent key={category} value={category} className="space-y-2">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {functions.map((fn) => (
                        <div
                          key={fn.name}
                          className="p-3 bg-muted rounded-lg space-y-1 cursor-pointer hover:bg-muted/80"
                          onClick={() => insertFunction(fn.formula)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{fn.name}</p>
                            <Badge variant="secondary">Insert</Badge>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">{fn.formula}</p>
                          <p className="text-xs text-muted-foreground">{fn.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Measures</Label>
              <p className="text-xs text-muted-foreground">
                Pre-configured measures for common scenarios
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickMeasures.map((measure) => (
                  <Button
                    key={measure.name}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-start"
                    onClick={() => {
                      setMeasureName(measure.name);
                      setDaxFormula(measure.formula);
                      toast.info("Formula loaded - click Create Measure to add it");
                    }}
                  >
                    <span className="text-lg mb-1">{measure.icon}</span>
                    <span className="text-xs font-semibold">{measure.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                DAX Best Practices
              </Label>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Use CALCULATE to modify filter context</p>
                <p>• Time intelligence requires a proper date table</p>
                <p>• SUMX iterates row-by-row, SUM is faster for simple aggregations</p>
                <p>• Use DIVIDE to handle division by zero</p>
                <p>• Variables (VAR) improve performance and readability</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
