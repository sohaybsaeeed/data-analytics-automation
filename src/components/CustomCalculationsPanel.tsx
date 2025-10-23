import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calculator, Plus, Trash2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomCalculationsPanelProps {
  data: any[];
  onCalculationApplied: (data: any[], calculationName: string) => void;
}

export const CustomCalculationsPanel = ({ data, onCalculationApplied }: CustomCalculationsPanelProps) => {
  const [calculations, setCalculations] = useState<any[]>([]);
  const [newCalcName, setNewCalcName] = useState("");
  const [newCalcType, setNewCalcType] = useState<'sum' | 'average' | 'custom'>('sum');
  const [selectedColumn, setSelectedColumn] = useState("");
  const [customFormula, setCustomFormula] = useState("");

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => typeof data[0]?.[col] === 'number');

  const createCalculation = () => {
    if (!newCalcName || !selectedColumn) {
      toast.error("Please provide a name and select a column");
      return;
    }

    const calculation = {
      id: Date.now(),
      name: newCalcName,
      type: newCalcType,
      column: selectedColumn,
      formula: customFormula
    };

    setCalculations([...calculations, calculation]);
    setNewCalcName("");
    setCustomFormula("");
    toast.success("Calculation created");
  };

  const applyCalculation = (calc: any) => {
    let result: any;
    const values = data.map(row => row[calc.column]).filter(v => typeof v === 'number');

    switch (calc.type) {
      case 'sum':
        result = values.reduce((a, b) => a + b, 0);
        break;
      case 'average':
        result = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'custom':
        try {
          // Simple formula evaluation (for demo purposes)
          result = eval(customFormula.replace(/COLUMN/g, selectedColumn));
        } catch (e) {
          toast.error("Invalid formula");
          return;
        }
        break;
    }

    toast.success(`${calc.name}: ${result.toFixed(2)}`);
    onCalculationApplied(data, calc.name);
  };

  const deleteCalculation = (id: number) => {
    setCalculations(calculations.filter(c => c.id !== id));
    toast.success("Calculation deleted");
  };

  const quickCalculations = [
    { name: 'Total Sum', type: 'sum', icon: '∑' },
    { name: 'Average', type: 'average', icon: 'x̄' },
    { name: 'Count', type: 'count', icon: '#' },
    { name: 'Min/Max', type: 'minmax', icon: '↕' },
    { name: 'Variance', type: 'variance', icon: 'σ²' },
    { name: 'Std Dev', type: 'stddev', icon: 'σ' },
  ];

  const runQuickCalc = (calcType: string) => {
    if (!selectedColumn || numericColumns.length === 0) {
      toast.error("Please select a numeric column");
      return;
    }

    const values = data.map(row => row[selectedColumn]).filter(v => typeof v === 'number');
    let result: string = "";

    switch (calcType) {
      case 'sum':
        result = `Sum: ${values.reduce((a, b) => a + b, 0).toFixed(2)}`;
        break;
      case 'average':
        result = `Average: ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}`;
        break;
      case 'count':
        result = `Count: ${values.length}`;
        break;
      case 'minmax':
        result = `Min: ${Math.min(...values).toFixed(2)}, Max: ${Math.max(...values).toFixed(2)}`;
        break;
      case 'variance':
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        result = `Variance: ${variance.toFixed(2)}`;
        break;
      case 'stddev':
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const stddev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length);
        result = `Std Dev: ${stddev.toFixed(2)}`;
        break;
    }

    toast.success(result, { duration: 5000 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Custom Calculations & Measures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Calculations */}
        <div className="space-y-3">
          <Label>Quick Calculations</Label>
          <div className="space-y-2">
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column for calculations" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-3 gap-2">
              {quickCalculations.map(calc => (
                <Button
                  key={calc.type}
                  variant="outline"
                  size="sm"
                  onClick={() => runQuickCalc(calc.type)}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-lg mb-1">{calc.icon}</span>
                  <span className="text-xs">{calc.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Create Custom Calculation */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Create Custom Calculation</Label>
          
          <div className="space-y-2">
            <Input
              placeholder="Calculation name"
              value={newCalcName}
              onChange={(e) => setNewCalcName(e.target.value)}
            />

            <Select value={newCalcType} onValueChange={(v: any) => setNewCalcType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="custom">Custom Formula</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {newCalcType === 'custom' && (
              <Textarea
                placeholder="Enter formula (use COLUMN as placeholder)"
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
              />
            )}

            <Button onClick={createCalculation} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Calculation
            </Button>
          </div>
        </div>

        {/* Saved Calculations */}
        {calculations.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Saved Calculations</Label>
            <div className="space-y-2">
              {calculations.map(calc => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{calc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {calc.type} on {calc.column}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyCalculation(calc)}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCalculation(calc.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculation Templates */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Common Calculation Templates</Label>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center p-2 cursor-pointer hover:bg-muted">
              Growth Rate
            </Badge>
            <Badge variant="outline" className="justify-center p-2 cursor-pointer hover:bg-muted">
              Year over Year
            </Badge>
            <Badge variant="outline" className="justify-center p-2 cursor-pointer hover:bg-muted">
              Running Total
            </Badge>
            <Badge variant="outline" className="justify-center p-2 cursor-pointer hover:bg-muted">
              Moving Average
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
