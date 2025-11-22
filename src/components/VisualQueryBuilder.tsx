import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Condition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface VisualQueryBuilderProps {
  onQueryGenerated: (query: string) => void;
  dbType: string;
}

export const VisualQueryBuilder = ({ onQueryGenerated, dbType }: VisualQueryBuilderProps) => {
  const [tableName, setTableName] = useState("");
  const [selectMode, setSelectMode] = useState<"all" | "specific">("all");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [newColumn, setNewColumn] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC");
  const [limit, setLimit] = useState("1000");

  const operators = [
    { value: "=", label: "Equals (=)" },
    { value: "!=", label: "Not equals (!=)" },
    { value: ">", label: "Greater than (>)" },
    { value: "<", label: "Less than (<)" },
    { value: ">=", label: "Greater or equal (>=)" },
    { value: "<=", label: "Less or equal (<=)" },
    { value: "LIKE", label: "Like (LIKE)" },
    { value: "IN", label: "In (IN)" },
    { value: "IS NULL", label: "Is NULL" },
    { value: "IS NOT NULL", label: "Is not NULL" },
  ];

  useEffect(() => {
    generateQuery();
  }, [tableName, selectMode, selectedColumns, conditions, orderBy, orderDirection, limit]);

  const generateQuery = () => {
    if (!tableName) {
      onQueryGenerated("");
      return;
    }

    let query = "SELECT ";

    // SELECT clause
    if (selectMode === "all" || selectedColumns.length === 0) {
      query += "*";
    } else {
      query += selectedColumns.join(", ");
    }

    // FROM clause
    query += ` FROM ${tableName}`;

    // WHERE clause
    if (conditions.length > 0) {
      const validConditions = conditions.filter(
        (c) => c.column && c.operator && (c.operator.includes("NULL") || c.value)
      );

      if (validConditions.length > 0) {
        query += " WHERE ";
        query += validConditions
          .map((c) => {
            if (c.operator === "IS NULL" || c.operator === "IS NOT NULL") {
              return `${c.column} ${c.operator}`;
            } else if (c.operator === "LIKE") {
              return `${c.column} ${c.operator} '%${c.value}%'`;
            } else if (c.operator === "IN") {
              return `${c.column} ${c.operator} (${c.value})`;
            } else if (typeof c.value === "string" && isNaN(Number(c.value))) {
              return `${c.column} ${c.operator} '${c.value}'`;
            } else {
              return `${c.column} ${c.operator} ${c.value}`;
            }
          })
          .join(" AND ");
      }
    }

    // ORDER BY clause
    if (orderBy) {
      query += ` ORDER BY ${orderBy} ${orderDirection}`;
    }

    // LIMIT clause
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    onQueryGenerated(query);
  };

  const addColumn = () => {
    if (newColumn && !selectedColumns.includes(newColumn)) {
      setSelectedColumns([...selectedColumns, newColumn]);
      setNewColumn("");
    }
  };

  const removeColumn = (column: string) => {
    setSelectedColumns(selectedColumns.filter((c) => c !== column));
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Math.random().toString(), column: "", operator: "=", value: "" },
    ]);
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">Visual Query Builder</h3>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {/* Table Name */}
          <div className="space-y-2">
            <Label htmlFor="table-name">Table Name *</Label>
            <Input
              id="table-name"
              placeholder="e.g., users, orders, products"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>

          {/* SELECT Columns */}
          <div className="space-y-2">
            <Label>Select Columns</Label>
            <Select value={selectMode} onValueChange={(v: any) => setSelectMode(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                <SelectItem value="all">All Columns (*)</SelectItem>
                <SelectItem value="specific">Specific Columns</SelectItem>
              </SelectContent>
            </Select>

            {selectMode === "specific" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Column name"
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addColumn()}
                  />
                  <Button onClick={addColumn} size="sm" type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {selectedColumns.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedColumns.map((col) => (
                      <Badge key={col} variant="secondary" className="gap-1">
                        {col}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeColumn(col)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* WHERE Conditions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Where Conditions</Label>
              <Button onClick={addCondition} size="sm" variant="outline" type="button">
                <Plus className="w-4 h-4 mr-1" />
                Add Condition
              </Button>
            </div>

            {conditions.map((condition) => (
              <div key={condition.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Column"
                  value={condition.column}
                  onChange={(e) => updateCondition(condition.id, "column", e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={condition.operator}
                  onValueChange={(v) => updateCondition(condition.id, "operator", v)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!condition.operator.includes("NULL") && (
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                    className="flex-1"
                  />
                )}
                <Button
                  onClick={() => removeCondition(condition.id)}
                  size="sm"
                  variant="ghost"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* ORDER BY */}
          <div className="space-y-2">
            <Label>Order By</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Column name (optional)"
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="flex-1"
              />
              <Select value={orderDirection} onValueChange={(v: any) => setOrderDirection(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value="ASC">ASC</SelectItem>
                  <SelectItem value="DESC">DESC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LIMIT */}
          <div className="space-y-2">
            <Label htmlFor="limit">Limit</Label>
            <Input
              id="limit"
              type="number"
              placeholder="1000"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 10,000 rows can be imported
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
