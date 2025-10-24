import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit3, Save, X, Plus, Trash2, Copy, Clipboard, Undo, Redo, Table2, Filter, Eye, MessageSquare, ZoomIn, Columns, Calculator, FileDown, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [formulaBar, setFormulaBar] = useState("");
  const [filterColumn, setFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [frozenColumns, setFrozenColumns] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>({});
  const [comments, setComments] = useState<{[key: string]: string}>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Update edited data when data prop changes
  useEffect(() => {
    setEditedData(data);
    setHistory([data]);
    setHistoryIndex(0);
  }, [data]);

  // Update formula bar when active cell changes
  useEffect(() => {
    if (activeCell && editedData[activeCell.row]) {
      setFormulaBar(String(editedData[activeCell.row][activeCell.col] || ""));
    }
  }, [activeCell, editedData]);

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

  const handleFormulaApply = () => {
    if (!activeCell) {
      toast.error("Select a cell first");
      return;
    }

    let result = formulaBar;
    
    // Simple formula evaluation
    if (formulaBar.startsWith("=")) {
      try {
        const formula = formulaBar.substring(1);
        
        // Handle SUM, AVG, COUNT, MIN, MAX functions
        if (formula.toUpperCase().startsWith("SUM(")) {
          const match = formula.match(/SUM\(([A-Za-z0-9_]+)\)/i);
          if (match) {
            const col = match[1];
            const sum = editedData.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
            result = String(sum);
          }
        } else if (formula.toUpperCase().startsWith("AVG(")) {
          const match = formula.match(/AVG\(([A-Za-z0-9_]+)\)/i);
          if (match) {
            const col = match[1];
            const values = editedData.map(row => Number(row[col]) || 0);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            result = String(avg.toFixed(2));
          }
        } else if (formula.toUpperCase().startsWith("COUNT(")) {
          const match = formula.match(/COUNT\(([A-Za-z0-9_]+)\)/i);
          if (match) {
            const col = match[1];
            const count = editedData.filter(row => row[col] != null && row[col] !== "").length;
            result = String(count);
          }
        } else if (formula.toUpperCase().startsWith("MIN(")) {
          const match = formula.match(/MIN\(([A-Za-z0-9_]+)\)/i);
          if (match) {
            const col = match[1];
            const min = Math.min(...editedData.map(row => Number(row[col]) || 0));
            result = String(min);
          }
        } else if (formula.toUpperCase().startsWith("MAX(")) {
          const match = formula.match(/MAX\(([A-Za-z0-9_]+)\)/i);
          if (match) {
            const col = match[1];
            const max = Math.max(...editedData.map(row => Number(row[col]) || 0));
            result = String(max);
          }
        } else {
          // Try to evaluate as arithmetic expression
          result = String(eval(formula));
        }
      } catch (error) {
        toast.error("Invalid formula");
        return;
      }
    }

    handleCellEdit(activeCell.row, activeCell.col, result);
    toast.success("Formula applied");
  };

  const handleAddColumn = () => {
    const newColName = prompt("Enter new column name:");
    if (!newColName) return;
    
    const newData = editedData.map(row => ({ ...row, [newColName]: "" }));
    setEditedData(newData);
    saveToHistory(newData);
    toast.success(`Column "${newColName}" added`);
  };

  const handleDeleteColumn = () => {
    if (!filterColumn) {
      toast.error("Select a column first");
      return;
    }

    const newData = editedData.map(row => {
      const { [filterColumn]: _, ...rest } = row;
      return rest;
    });
    setEditedData(newData);
    saveToHistory(newData);
    setFilterColumn("");
    toast.success(`Column "${filterColumn}" deleted`);
  };

  const handleFilter = () => {
    if (!filterColumn || !filterValue) {
      toast.error("Select column and enter filter value");
      return;
    }

    const filtered = data.filter(row => 
      String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
    );
    setEditedData(filtered);
    toast.success(`Filtered ${filtered.length} rows`);
  };

  const handleClearFilter = () => {
    setEditedData(data);
    setFilterValue("");
    toast.success("Filter cleared");
  };

  const handleAddComment = () => {
    if (!activeCell) {
      toast.error("Select a cell first");
      return;
    }
    
    const comment = prompt("Enter comment:");
    if (comment) {
      setComments({ ...comments, [`${activeCell.row}-${activeCell.col}`]: comment });
      toast.success("Comment added");
    }
  };

  const handleExportData = () => {
    const csv = [
      columns.join(","),
      ...editedData.map(row => columns.map(col => row[col]).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    toast.success("Data exported");
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
            Excel-Style Data Editor
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
                  Save & Update Analytics
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
          <>
            {/* Formula Bar */}
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <Label className="text-xs font-semibold mb-2 block">Formula Bar</Label>
              <div className="flex gap-2">
                <Input
                  value={formulaBar}
                  onChange={(e) => setFormulaBar(e.target.value)}
                  placeholder="Enter value or formula (e.g., =SUM(column), =AVG(column))"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleFormulaApply}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formulas: =SUM(col), =AVG(col), =COUNT(col), =MIN(col), =MAX(col)
              </p>
            </div>

            {/* Excel Ribbon Tabs */}
            <Tabs defaultValue="home" className="mb-4">
              <TabsList className="grid w-full grid-cols-6 bg-muted">
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="insert">Insert</TabsTrigger>
                <TabsTrigger value="formulas">Formulas</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="view">View</TabsTrigger>
              </TabsList>

              {/* Home Tab */}
              <TabsContent value="home" className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={handleUndo} disabled={historyIndex === 0}>
                      <Undo className="w-4 h-4 mr-2" />
                      Undo
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                      <Redo className="w-4 h-4 mr-2" />
                      Redo
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePaste} disabled={!copiedData}>
                      <Clipboard className="w-4 h-4 mr-2" />
                      Paste
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDeleteRows} disabled={selectedRows.length === 0}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Rows
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Insert Tab */}
              <TabsContent value="insert" className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={handleAddRow}>
                      <Plus className="w-4 h-4 mr-2" />
                      Insert Row
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleAddColumn}>
                      <Columns className="w-4 h-4 mr-2" />
                      Insert Column
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDeleteColumn} disabled={!filterColumn}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Column
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={selectedRows.length === 0}>
                          <Table2 className="w-4 h-4 mr-2" />
                          Bulk Operations
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Operations</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full" onClick={() => handleBulkOperation('duplicate')}>
                            Duplicate Selected Rows
                          </Button>
                          <Button variant="outline" className="w-full" onClick={() => handleBulkOperation('clear')}>
                            Clear Selected Rows
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </TabsContent>

              {/* Formulas Tab */}
              <TabsContent value="formulas" className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-semibold mb-2 block">Quick Formulas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setFormulaBar("=SUM()")}>
                      Σ SUM
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFormulaBar("=AVG()")}>
                      μ AVG
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFormulaBar("=COUNT()")}>
                      # COUNT
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFormulaBar("=MIN()")}>
                      ↓ MIN
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFormulaBar("=MAX()")}>
                      ↑ MAX
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-xs mb-1 block">Filter Column</Label>
                      <Select value={filterColumn} onValueChange={setFilterColumn}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {columns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-xs mb-1 block">Filter Value</Label>
                      <Input
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        placeholder="Enter value..."
                        className="bg-background"
                      />
                    </div>
                    <Button size="sm" onClick={handleFilter}>
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filter
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleClearFilter}>
                      Clear Filter
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSort(filterColumn || columns[0])}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Sort Data
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExportData}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="review" className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Button size="sm" variant="outline" onClick={handleAddComment}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                  {Object.keys(comments).length > 0 && (
                    <div className="mt-3">
                      <Label className="text-xs font-semibold mb-2 block">Comments</Label>
                      <ScrollArea className="h-20 w-full rounded border p-2">
                        {Object.entries(comments).map(([key, comment]) => (
                          <div key={key} className="text-xs mb-1">
                            <span className="font-semibold">{key}:</span> {comment}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* View Tab */}
              <TabsContent value="view" className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Label className="text-sm">Zoom:</Label>
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                      -
                    </Button>
                    <span className="text-sm font-semibold min-w-[60px] text-center">{zoom}%</span>
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                      +
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setZoom(100)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label className="text-sm">Freeze Columns:</Label>
                    <Input
                      type="number"
                      min="0"
                      max={columns.length}
                      value={frozenColumns}
                      onChange={(e) => setFrozenColumns(parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mb-2">
              <p className="text-xs text-muted-foreground">
                💡 Use arrow keys, Tab, Enter for navigation • Ctrl+C/V for copy/paste • Ctrl+Z/Y for undo/redo • Click cells to edit
              </p>
            </div>
          </>
        )}

        <div className="overflow-x-auto border rounded-lg" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {editMode && (
                  <th className="p-2 w-10 border bg-muted">
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
                {columns.map((col, colIdx) => (
                  <th
                    key={col}
                    className={`text-left p-2 font-semibold cursor-pointer hover:bg-muted-foreground/10 border ${colIdx < frozenColumns ? 'sticky left-0 z-20 bg-muted' : ''}`}
                    onClick={() => handleSort(col)}
                    style={colIdx < frozenColumns ? { left: `${colIdx * 150}px` } : {}}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {sortColumn === col && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                      {comments[`header-${col}`] && (
                        <MessageSquare className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editedData.slice(0, 100).map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b hover:bg-muted/50 ${selectedRows.includes(rowIdx) ? 'bg-primary/10' : ''}`}
                >
                  {editMode && (
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rowIdx)}
                        onChange={() => toggleRowSelection(rowIdx)}
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => {
                    const cellKey = `${rowIdx}-${col}`;
                    const hasComment = comments[cellKey];
                    
                    return (
                      <td 
                        key={col} 
                        className={`p-1 border relative ${activeCell?.row === rowIdx && activeCell?.col === col ? 'ring-2 ring-primary' : ''} ${colIdx < frozenColumns ? 'sticky left-0 z-10 bg-background' : ''}`}
                        style={colIdx < frozenColumns ? { left: `${colIdx * 150}px` } : {}}
                      >
                        {hasComment && (
                          <MessageSquare className="absolute top-0 right-0 w-3 h-3 text-primary" />
                        )}
                        {editMode ? (
                          <Input
                            ref={(el) => {
                              if (el) inputRefs.current[cellKey] = el;
                            }}
                            value={String(row[col] || "")}
                            onChange={(e) => handleCellEdit(rowIdx, col, e.target.value)}
                            onFocus={() => setActiveCell({ row: rowIdx, col })}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            className="min-w-[100px] h-8 border-0"
                          />
                        ) : (
                          <span className="px-3 py-2 block">{String(row[col])}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editedData.length > 100 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Showing first 100 rows of {editedData.length} total rows (for performance)
          </p>
        )}
      </CardContent>
    </Card>
  );
};
