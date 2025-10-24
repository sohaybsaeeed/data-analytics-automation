import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit3, Save, X, Plus, Trash2, Copy, Clipboard, Undo, Redo } from "lucide-react";
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
  const [activeCell, setActiveCell] = useState<{ row: number; col: string } | null>(null);
  const [copiedData, setCopiedData] = useState<any>(null);
  const [history, setHistory] = useState<any[][]>([data]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Update edited data when data prop changes
  useEffect(() => {
    setEditedData(data);
    setHistory([data]);
    setHistoryIndex(0);
  }, [data]);

  const saveToHistory = (newData: any[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedData(history[historyIndex - 1]);
      toast.success("Undo successful");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedData(history[historyIndex + 1]);
      toast.success("Redo successful");
    }
  };

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setEditedData(newData);
    saveToHistory(newData);
  };

  const handleCopy = () => {
    if (activeCell) {
      const cellValue = editedData[activeCell.row][activeCell.col];
      setCopiedData({ value: cellValue, single: true });
      navigator.clipboard.writeText(String(cellValue));
      toast.success("Cell copied");
    } else if (selectedRows.length > 0) {
      const selectedData = selectedRows.map(idx => editedData[idx]);
      setCopiedData({ value: selectedData, single: false });
      toast.success(`${selectedRows.length} row(s) copied`);
    }
  };

  const handlePaste = () => {
    if (!copiedData) {
      toast.error("Nothing to paste");
      return;
    }

    if (copiedData.single && activeCell) {
      handleCellEdit(activeCell.row, activeCell.col, copiedData.value);
      toast.success("Cell pasted");
    } else if (!copiedData.single && copiedData.value) {
      const newData = [...editedData, ...copiedData.value];
      setEditedData(newData);
      saveToHistory(newData);
      toast.success("Rows pasted");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    const col = columns[colIndex];
    
    // Arrow key navigation
    if (e.key === 'ArrowDown' && rowIndex < editedData.length - 1) {
      e.preventDefault();
      setActiveCell({ row: rowIndex + 1, col });
      const key = `${rowIndex + 1}-${col}`;
      inputRefs.current[key]?.focus();
    } else if (e.key === 'ArrowUp' && rowIndex > 0) {
      e.preventDefault();
      setActiveCell({ row: rowIndex - 1, col });
      const key = `${rowIndex - 1}-${col}`;
      inputRefs.current[key]?.focus();
    } else if (e.key === 'ArrowRight' && colIndex < columns.length - 1) {
      e.preventDefault();
      const nextCol = columns[colIndex + 1];
      setActiveCell({ row: rowIndex, col: nextCol });
      const key = `${rowIndex}-${nextCol}`;
      inputRefs.current[key]?.focus();
    } else if (e.key === 'ArrowLeft' && colIndex > 0) {
      e.preventDefault();
      const prevCol = columns[colIndex - 1];
      setActiveCell({ row: rowIndex, col: prevCol });
      const key = `${rowIndex}-${prevCol}`;
      inputRefs.current[key]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < editedData.length - 1) {
        setActiveCell({ row: rowIndex + 1, col });
        const key = `${rowIndex + 1}-${col}`;
        inputRefs.current[key]?.focus();
      }
    } else if (e.key === 'Tab' && !e.shiftKey && colIndex < columns.length - 1) {
      e.preventDefault();
      const nextCol = columns[colIndex + 1];
      setActiveCell({ row: rowIndex, col: nextCol });
      const key = `${rowIndex}-${nextCol}`;
      inputRefs.current[key]?.focus();
    } else if (e.key === 'Tab' && e.shiftKey && colIndex > 0) {
      e.preventDefault();
      const prevCol = columns[colIndex - 1];
      setActiveCell({ row: rowIndex, col: prevCol });
      const key = `${rowIndex}-${prevCol}`;
      inputRefs.current[key]?.focus();
    }
    
    // Copy/Paste with Ctrl+C / Ctrl+V
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    }
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
    const newData = [...editedData, newRow];
    setEditedData(newData);
    saveToHistory(newData);
    toast.success("New row added");
  };

  const handleDeleteRows = () => {
    const newData = editedData.filter((_, idx) => !selectedRows.includes(idx));
    setEditedData(newData);
    saveToHistory(newData);
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
        const newData = [...editedData, ...duplicates];
        setEditedData(newData);
        saveToHistory(newData);
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
        saveToHistory(cleared);
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
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy (Ctrl+C)
              </Button>
              <Button size="sm" variant="outline" onClick={handlePaste} disabled={!copiedData}>
                <Clipboard className="w-4 h-4 mr-2" />
                Paste (Ctrl+V)
              </Button>
              <Button size="sm" variant="outline" onClick={handleUndo} disabled={historyIndex === 0}>
                <Undo className="w-4 h-4 mr-2" />
                Undo (Ctrl+Z)
              </Button>
              <Button size="sm" variant="outline" onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                <Redo className="w-4 h-4 mr-2" />
                Redo (Ctrl+Y)
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
            <p className="text-xs text-muted-foreground">
              💡 Use arrow keys, Tab, Enter for navigation • Ctrl+C/V for copy/paste • Ctrl+Z/Y for undo/redo
            </p>
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
                  {columns.map((col, colIdx) => (
                    <td 
                      key={col} 
                      className={`p-1 ${activeCell?.row === rowIdx && activeCell?.col === col ? 'ring-2 ring-primary' : ''}`}
                    >
                      {editMode ? (
                        <Input
                          ref={(el) => {
                            if (el) inputRefs.current[`${rowIdx}-${col}`] = el;
                          }}
                          value={String(row[col] || "")}
                          onChange={(e) => handleCellEdit(rowIdx, col, e.target.value)}
                          onFocus={() => setActiveCell({ row: rowIdx, col })}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                          className="min-w-[100px] h-8"
                        />
                      ) : (
                        <span className="px-3 py-2 block">{String(row[col])}</span>
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
