import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit3, Save, X, Plus, Trash2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataEditorPanelProps {
  data: any[];
  onDataUpdate: (newData: any[]) => void;
}

export const DataEditorPanel = ({ data, onDataUpdate }: DataEditorPanelProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setEditedData(newData);
  };

  const handleSave = () => {
    onDataUpdate(editedData);
    setEditMode(false);
    toast.success("Data updated successfully");
  };

  const handleCancel = () => {
    setEditedData(data);
    setEditMode(false);
    toast.info("Changes discarded");
  };

  const handleAddRow = () => {
    const newRow: any = {};
    columns.forEach(col => newRow[col] = "");
    setEditedData([...editedData, newRow]);
    toast.success("New row added");
  };

  const handleDeleteRows = () => {
    const newData = editedData.filter((_, idx) => !selectedRows.includes(idx));
    setEditedData(newData);
    setSelectedRows([]);
    toast.success(`Deleted ${selectedRows.length} row(s)`);
  };

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...editedData].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return direction === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    
    setEditedData(sorted);
  };

  const handleBulkOperation = (operation: string) => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows first");
      return;
    }

    switch (operation) {
      case 'duplicate':
        const duplicates = selectedRows.map(idx => ({ ...editedData[idx] }));
        setEditedData([...editedData, ...duplicates]);
        toast.success(`Duplicated ${selectedRows.length} row(s)`);
        break;
      case 'clear':
        const cleared = editedData.map((row, idx) => {
          if (selectedRows.includes(idx)) {
            const newRow: any = {};
            columns.forEach(col => newRow[col] = "");
            return newRow;
          }
          return row;
        });
        setEditedData(cleared);
        toast.success("Selected rows cleared");
        break;
      default:
        break;
    }
  };

  const toggleRowSelection = (rowIndex: number) => {
    if (selectedRows.includes(rowIndex)) {
      setSelectedRows(selectedRows.filter(idx => idx !== rowIndex));
    } else {
      setSelectedRows([...selectedRows, rowIndex]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Data Editor
          </span>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setEditMode(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Data
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editMode && (
          <div className="mb-4 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={handleAddRow}>
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteRows}
                disabled={selectedRows.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedRows.length})
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={selectedRows.length === 0}>
                    Bulk Operations
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Operations</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleBulkOperation('duplicate')}
                    >
                      Duplicate Selected Rows
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleBulkOperation('clear')}
                    >
                      Clear Selected Rows
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {editMode && (
                  <th className="p-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === editedData.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(editedData.map((_, idx) => idx));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th
                    key={col}
                    className="text-left p-2 font-semibold cursor-pointer hover:bg-muted-foreground/10"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {sortColumn === col && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editedData.slice(0, 20).map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b hover:bg-muted/50 ${selectedRows.includes(rowIdx) ? 'bg-primary/10' : ''}`}
                >
                  {editMode && (
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rowIdx)}
                        onChange={() => toggleRowSelection(rowIdx)}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col} className="p-2">
                      {editMode ? (
                        <Input
                          value={String(row[col] || "")}
                          onChange={(e) => handleCellEdit(rowIdx, col, e.target.value)}
                          className="min-w-[100px]"
                        />
                      ) : (
                        <span>{String(row[col])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editedData.length > 20 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Showing first 20 rows of {editedData.length} total rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};
