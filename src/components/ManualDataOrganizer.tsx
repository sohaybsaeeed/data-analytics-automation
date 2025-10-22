import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, ArrowDown, Check } from "lucide-react";

interface ManualDataOrganizerProps {
  data: any[];
  onConfirm: (organizedData: any[], selectedColumns: string[]) => void;
}

const ManualDataOrganizer = ({ data, onConfirm }: ManualDataOrganizerProps) => {
  const [columns, setColumns] = useState<string[]>(
    data.length > 0 ? Object.keys(data[0]) : []
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    data.length > 0 ? Object.keys(data[0]) : []
  );

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
      setColumns(newColumns);
    }
  };

  const handleConfirm = () => {
    // Reorder data based on column order and filter by selected columns
    const organizedData = data.map(row => {
      const newRow: any = {};
      columns.forEach(col => {
        if (selectedColumns.includes(col)) {
          newRow[col] = row[col];
        }
      });
      return newRow;
    });
    
    onConfirm(organizedData, selectedColumns);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Organize Your Data</CardTitle>
        <CardDescription>
          Select columns to include and reorder them as needed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {columns.map((column, index) => (
              <div
                key={column}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedColumns.includes(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                  <span className="font-medium">{column}</span>
                  <span className="text-xs text-muted-foreground">
                    ({typeof data[0]?.[column]})
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveColumn(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveColumn(index, 'down')}
                    disabled={index === columns.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedColumns.length} of {columns.length} columns selected
          </div>
          <Button onClick={handleConfirm} disabled={selectedColumns.length === 0}>
            <Check className="w-4 h-4 mr-2" />
            Confirm Organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualDataOrganizer;
