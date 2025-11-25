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

interface JoinClause {
  id: string;
  tableName: string;
  joinType: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN" | "FULL OUTER JOIN";
  leftColumn: string;
  rightColumn: string;
}

interface AggregateColumn {
  id: string;
  function: "COUNT" | "SUM" | "AVG" | "MIN" | "MAX";
  column: string;
  alias: string;
}

interface HavingCondition {
  id: string;
  aggregateFunction: string;
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
  const [joins, setJoins] = useState<JoinClause[]>([]);
  const [aggregateColumns, setAggregateColumns] = useState<AggregateColumn[]>([]);
  const [groupByColumns, setGroupByColumns] = useState<string[]>([]);
  const [newGroupByColumn, setNewGroupByColumn] = useState("");
  const [havingConditions, setHavingConditions] = useState<HavingCondition[]>([]);
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
  }, [tableName, selectMode, selectedColumns, conditions, joins, aggregateColumns, groupByColumns, havingConditions, orderBy, orderDirection, limit]);

  const generateQuery = () => {
    if (!tableName) {
      onQueryGenerated("");
      return;
    }

    let query = "SELECT ";

    // SELECT clause with aggregates
    const selectParts: string[] = [];
    
    if (aggregateColumns.length > 0) {
      // When using aggregates, build the select clause differently
      aggregateColumns.forEach((agg) => {
        const aggExpr = `${agg.function}(${agg.column})${agg.alias ? ` AS ${agg.alias}` : ""}`;
        selectParts.push(aggExpr);
      });
      
      // Add group by columns to select
      groupByColumns.forEach((col) => {
        selectParts.push(col);
      });
      
      query += selectParts.join(", ");
    } else if (selectMode === "all" || selectedColumns.length === 0) {
      query += "*";
    } else {
      query += selectedColumns.join(", ");
    }

    // FROM clause
    query += ` FROM ${tableName}`;

    // JOIN clauses
    if (joins.length > 0) {
      const validJoins = joins.filter(
        (j) => j.tableName && j.leftColumn && j.rightColumn
      );
      validJoins.forEach((join) => {
        query += ` ${join.joinType} ${join.tableName} ON ${join.leftColumn} = ${join.rightColumn}`;
      });
    }

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

    // GROUP BY clause
    if (groupByColumns.length > 0) {
      query += ` GROUP BY ${groupByColumns.join(", ")}`;
    }

    // HAVING clause
    if (havingConditions.length > 0) {
      const validHavingConditions = havingConditions.filter(
        (h) => h.aggregateFunction && h.column && h.operator && h.value
      );

      if (validHavingConditions.length > 0) {
        query += " HAVING ";
        query += validHavingConditions
          .map((h) => {
            const aggExpr = `${h.aggregateFunction}(${h.column})`;
            if (typeof h.value === "string" && isNaN(Number(h.value))) {
              return `${aggExpr} ${h.operator} '${h.value}'`;
            } else {
              return `${aggExpr} ${h.operator} ${h.value}`;
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

  const addJoin = () => {
    setJoins([
      ...joins,
      {
        id: Math.random().toString(),
        tableName: "",
        joinType: "INNER JOIN",
        leftColumn: "",
        rightColumn: "",
      },
    ]);
  };

  const updateJoin = (id: string, field: keyof JoinClause, value: string) => {
    setJoins(joins.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  };

  const removeJoin = (id: string) => {
    setJoins(joins.filter((j) => j.id !== id));
  };

  const addAggregateColumn = () => {
    setAggregateColumns([
      ...aggregateColumns,
      { id: Math.random().toString(), function: "COUNT", column: "", alias: "" },
    ]);
  };

  const updateAggregateColumn = (id: string, field: keyof AggregateColumn, value: string) => {
    setAggregateColumns(
      aggregateColumns.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAggregateColumn = (id: string) => {
    setAggregateColumns(aggregateColumns.filter((a) => a.id !== id));
  };

  const addGroupByColumn = () => {
    if (newGroupByColumn && !groupByColumns.includes(newGroupByColumn)) {
      setGroupByColumns([...groupByColumns, newGroupByColumn]);
      setNewGroupByColumn("");
    }
  };

  const removeGroupByColumn = (column: string) => {
    setGroupByColumns(groupByColumns.filter((c) => c !== column));
  };

  const addHavingCondition = () => {
    setHavingConditions([
      ...havingConditions,
      { id: Math.random().toString(), aggregateFunction: "COUNT", column: "", operator: "=", value: "" },
    ]);
  };

  const updateHavingCondition = (id: string, field: keyof HavingCondition, value: string) => {
    setHavingConditions(
      havingConditions.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const removeHavingCondition = (id: string) => {
    setHavingConditions(havingConditions.filter((h) => h.id !== id));
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

          {/* JOIN Tables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Join Tables</Label>
              <Button onClick={addJoin} size="sm" variant="outline" type="button">
                <Plus className="w-4 h-4 mr-1" />
                Add Join
              </Button>
            </div>

            {joins.map((join) => (
              <div key={join.id} className="space-y-2 p-3 border rounded-md bg-muted/50">
                <div className="flex gap-2 items-start">
                  <Select
                    value={join.joinType}
                    onValueChange={(v: any) => updateJoin(join.id, "joinType", v)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      <SelectItem value="INNER JOIN">INNER JOIN</SelectItem>
                      <SelectItem value="LEFT JOIN">LEFT JOIN</SelectItem>
                      <SelectItem value="RIGHT JOIN">RIGHT JOIN</SelectItem>
                      <SelectItem value="FULL OUTER JOIN">FULL OUTER JOIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Table name"
                    value={join.tableName}
                    onChange={(e) => updateJoin(join.id, "tableName", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeJoin(join.id)}
                    size="sm"
                    variant="ghost"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">ON</Label>
                  <Input
                    placeholder="table1.column"
                    value={join.leftColumn}
                    onChange={(e) => updateJoin(join.id, "leftColumn", e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">=</span>
                  <Input
                    placeholder="table2.column"
                    value={join.rightColumn}
                    onChange={(e) => updateJoin(join.id, "rightColumn", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
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

          {/* AGGREGATE Functions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Aggregate Functions</Label>
              <Button onClick={addAggregateColumn} size="sm" variant="outline" type="button">
                <Plus className="w-4 h-4 mr-1" />
                Add Aggregate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use aggregate functions like COUNT, SUM, AVG for data analysis
            </p>

            {aggregateColumns.map((agg) => (
              <div key={agg.id} className="flex gap-2 items-start p-3 border rounded-md bg-muted/50">
                <Select
                  value={agg.function}
                  onValueChange={(v: any) => updateAggregateColumn(agg.id, "function", v)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="COUNT">COUNT</SelectItem>
                    <SelectItem value="SUM">SUM</SelectItem>
                    <SelectItem value="AVG">AVG</SelectItem>
                    <SelectItem value="MIN">MIN</SelectItem>
                    <SelectItem value="MAX">MAX</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Column (or * for COUNT)"
                  value={agg.column}
                  onChange={(e) => updateAggregateColumn(agg.id, "column", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Alias (optional)"
                  value={agg.alias}
                  onChange={(e) => updateAggregateColumn(agg.id, "alias", e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeAggregateColumn(agg.id)}
                  size="sm"
                  variant="ghost"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* GROUP BY */}
          <div className="space-y-2">
            <Label>Group By Columns</Label>
            <p className="text-xs text-muted-foreground">
              Required when using aggregate functions
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Column name"
                value={newGroupByColumn}
                onChange={(e) => setNewGroupByColumn(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addGroupByColumn()}
              />
              <Button onClick={addGroupByColumn} size="sm" type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {groupByColumns.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {groupByColumns.map((col) => (
                  <Badge key={col} variant="secondary" className="gap-1">
                    {col}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeGroupByColumn(col)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* HAVING Conditions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Having Conditions</Label>
              <Button onClick={addHavingCondition} size="sm" variant="outline" type="button">
                <Plus className="w-4 h-4 mr-1" />
                Add Having
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Filter results based on aggregate values
            </p>

            {havingConditions.map((having) => (
              <div key={having.id} className="flex gap-2 items-start">
                <Select
                  value={having.aggregateFunction}
                  onValueChange={(v) => updateHavingCondition(having.id, "aggregateFunction", v)}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="COUNT">COUNT</SelectItem>
                    <SelectItem value="SUM">SUM</SelectItem>
                    <SelectItem value="AVG">AVG</SelectItem>
                    <SelectItem value="MIN">MIN</SelectItem>
                    <SelectItem value="MAX">MAX</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Column"
                  value={having.column}
                  onChange={(e) => updateHavingCondition(having.id, "column", e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={having.operator}
                  onValueChange={(v) => updateHavingCondition(having.id, "operator", v)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value="!=">!=</SelectItem>
                    <SelectItem value=">">{">"}</SelectItem>
                    <SelectItem value="<">{"<"}</SelectItem>
                    <SelectItem value=">=">{">="}</SelectItem>
                    <SelectItem value="<=">{"<="}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={having.value}
                  onChange={(e) => updateHavingCondition(having.id, "value", e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeHavingCondition(having.id)}
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
