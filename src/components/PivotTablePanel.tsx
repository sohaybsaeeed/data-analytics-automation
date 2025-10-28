import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table2, Plus, X, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PivotTablePanelProps {
  data: any[];
}

export const PivotTablePanel = ({ data }: PivotTablePanelProps) => {
  const [rowFields, setRowFields] = useState<string[]>([]);
  const [columnFields, setColumnFields] = useState<string[]>([]);
  const [valueFields, setValueFields] = useState<string[]>([]);
  const [aggregation, setAggregation] = useState<'sum' | 'average' | 'count' | 'min' | 'max'>('sum');
  const [selectedField, setSelectedField] = useState<string>("");

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const availableFields = columns.filter(
    col => !rowFields.includes(col) && !columnFields.includes(col) && !valueFields.includes(col)
  );
  const numericColumns = columns.filter(col => typeof data[0]?.[col] === 'number');

  const pivotData = useMemo(() => {
    if (rowFields.length === 0 || valueFields.length === 0) {
      return null;
    }

    const grouped: any = {};

    data.forEach(row => {
      const rowKey = rowFields.map(field => row[field]).join('|');
      const colKey = columnFields.length > 0 
        ? columnFields.map(field => row[field]).join('|')
        : 'value';

      if (!grouped[rowKey]) {
        grouped[rowKey] = {};
      }

      if (!grouped[rowKey][colKey]) {
        grouped[rowKey][colKey] = [];
      }

      valueFields.forEach(valueField => {
        const value = row[valueField];
        if (typeof value === 'number') {
          grouped[rowKey][colKey].push(value);
        }
      });
    });

    // Calculate aggregations
    const result: any = {};
    Object.keys(grouped).forEach(rowKey => {
      result[rowKey] = {};
      Object.keys(grouped[rowKey]).forEach(colKey => {
        const values = grouped[rowKey][colKey];
        if (values.length > 0) {
          switch (aggregation) {
            case 'sum':
              result[rowKey][colKey] = values.reduce((a: number, b: number) => a + b, 0);
              break;
            case 'average':
              result[rowKey][colKey] = values.reduce((a: number, b: number) => a + b, 0) / values.length;
              break;
            case 'count':
              result[rowKey][colKey] = values.length;
              break;
            case 'min':
              result[rowKey][colKey] = Math.min(...values);
              break;
            case 'max':
              result[rowKey][colKey] = Math.max(...values);
              break;
          }
        }
      });
    });

    return result;
  }, [data, rowFields, columnFields, valueFields, aggregation]);

  const columnKeys = useMemo(() => {
    if (!pivotData) return [];
    const keys = new Set<string>();
    Object.values(pivotData).forEach((row: any) => {
      Object.keys(row).forEach(key => keys.add(key));
    });
    return Array.from(keys);
  }, [pivotData]);

  const addToRows = () => {
    if (selectedField && !rowFields.includes(selectedField)) {
      setRowFields([...rowFields, selectedField]);
      setSelectedField("");
    }
  };

  const addToColumns = () => {
    if (selectedField && !columnFields.includes(selectedField)) {
      setColumnFields([...columnFields, selectedField]);
      setSelectedField("");
    }
  };

  const addToValues = () => {
    if (selectedField && numericColumns.includes(selectedField) && !valueFields.includes(selectedField)) {
      setValueFields([...valueFields, selectedField]);
      setSelectedField("");
    } else if (selectedField && !numericColumns.includes(selectedField)) {
      toast.error("Value fields must be numeric");
    }
  };

  const removeFromRows = (field: string) => {
    setRowFields(rowFields.filter(f => f !== field));
  };

  const removeFromColumns = (field: string) => {
    setColumnFields(columnFields.filter(f => f !== field));
  };

  const removeFromValues = (field: string) => {
    setValueFields(valueFields.filter(f => f !== field));
  };

  const resetPivot = () => {
    setRowFields([]);
    setColumnFields([]);
    setValueFields([]);
    toast.info("Pivot table reset");
  };

  const exportPivot = () => {
    if (!pivotData) {
      toast.error("No pivot data to export");
      return;
    }

    const csv = [
      ['', ...columnKeys].join(','),
      ...Object.entries(pivotData).map(([rowKey, values]: [string, any]) => 
        [rowKey, ...columnKeys.map(colKey => values[colKey] || 0)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pivot-table.csv';
    a.click();
    toast.success("Pivot table exported");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Table2 className="w-5 h-5" />
            Pivot Table Analysis
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportPivot}>
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={resetPivot}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field Selector */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={addToRows}>
              <Plus className="w-3 h-3 mr-1" />
              Add to Rows
            </Button>
            <Button variant="outline" size="sm" onClick={addToColumns}>
              <Plus className="w-3 h-3 mr-1" />
              Add to Columns
            </Button>
            <Button variant="outline" size="sm" onClick={addToValues}>
              <Plus className="w-3 h-3 mr-1" />
              Add to Values
            </Button>
          </div>
        </div>

        {/* Field Areas */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-2">Row Fields</Label>
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-lg bg-muted/20">
              {rowFields.length === 0 ? (
                <span className="text-xs text-muted-foreground">Drag fields here</span>
              ) : (
                rowFields.map(field => (
                  <Badge key={field} variant="secondary" className="gap-1">
                    {field}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeFromRows(field)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2">Column Fields</Label>
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-lg bg-muted/20">
              {columnFields.length === 0 ? (
                <span className="text-xs text-muted-foreground">Drag fields here</span>
              ) : (
                columnFields.map(field => (
                  <Badge key={field} variant="secondary" className="gap-1">
                    {field}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeFromColumns(field)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2">Value Fields</Label>
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-lg bg-muted/20">
              {valueFields.length === 0 ? (
                <span className="text-xs text-muted-foreground">Drag numeric fields here</span>
              ) : (
                valueFields.map(field => (
                  <Badge key={field} variant="default" className="gap-1">
                    {aggregation}({field})
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeFromValues(field)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <Label>Aggregation Function</Label>
            <Select value={aggregation} onValueChange={(v: any) => setAggregation(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="min">Minimum</SelectItem>
                <SelectItem value="max">Maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pivot Table Display */}
        {pivotData && (
          <div className="border rounded-lg">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold bg-muted sticky left-0">
                      {rowFields.join(' / ')}
                    </TableHead>
                    {columnKeys.map(colKey => (
                      <TableHead key={colKey} className="text-center font-semibold bg-muted">
                        {colKey}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(pivotData).map(([rowKey, values]: [string, any]) => (
                    <TableRow key={rowKey}>
                      <TableCell className="font-medium sticky left-0 bg-background">
                        {rowKey}
                      </TableCell>
                      {columnKeys.map(colKey => (
                        <TableCell key={colKey} className="text-center">
                          {values[colKey] !== undefined 
                            ? typeof values[colKey] === 'number'
                              ? values[colKey].toFixed(2)
                              : values[colKey]
                            : '-'
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {!pivotData && (
          <div className="text-center py-8 text-muted-foreground">
            <Table2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Add row and value fields to create pivot table</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
