import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, PieChart, Pie,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, FunnelChart, Funnel, ComposedChart, LabelList, Rectangle
} from "recharts";
import {
  Download, Filter, Settings2, TrendingUp, Layers, Maximize2, Grid3x3,
  Eye, EyeOff, Paintbrush, RefreshCw, Save, Share2, Bookmark, Edit3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AdvancedVisualizationPanelProps {
  data: any[];
  insights: any[];
  onDataEdit?: (editedData: any[]) => void;
}

export const AdvancedVisualizationPanel = ({ data, insights, onDataEdit }: AdvancedVisualizationPanelProps) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [chartType, setChartType] = useState("bar");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [chartSize, setChartSize] = useState(400);
  const [colorScheme, setColorScheme] = useState("default");
  const [savedViews, setSavedViews] = useState<any[]>([]);
  const [customCalculations, setCustomCalculations] = useState<any[]>([]);
  const [chartAnimation, setChartAnimation] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartSubtitle, setChartSubtitle] = useState("");
  const [drillDownPath, setDrillDownPath] = useState<string[]>([]);
  const [crossFilterEnabled, setCrossFilterEnabled] = useState(false);

  const COLORS = {
    default: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a4de6c'],
    ocean: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
    warm: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF1493'],
    cool: ['#4A90E2', '#7B68EE', '#87CEEB', '#4169E1', '#1E90FF'],
    nature: ['#32CD32', '#228B22', '#90EE90', '#00FA9A', '#3CB371']
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => typeof data[0]?.[col] === 'number');
  
  const filteredData = data.filter(row => {
    return Object.entries(activeFilters).every(([column, filterValue]) => {
      if (!filterValue) return true;
      const value = row[column];
      if (typeof filterValue === 'object' && 'min' in filterValue) {
        return value >= filterValue.min && value <= filterValue.max;
      }
      return value === filterValue || String(value).includes(String(filterValue));
    });
  });

  const handleExport = (format: 'png' | 'csv' | 'json') => {
    if (format === 'csv') {
      const csv = [
        columns.join(','),
        ...filteredData.map(row => columns.map(col => row[col]).join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data-export.csv';
      a.click();
      toast.success("Exported as CSV");
    } else if (format === 'json') {
      const json = JSON.stringify(filteredData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data-export.json';
      a.click();
      toast.success("Exported as JSON");
    } else {
      toast.info("PNG export requires html2canvas library");
    }
  };

  const saveCurrentView = () => {
    const view = {
      id: Date.now(),
      name: `View ${savedViews.length + 1}`,
      chartType,
      filters: activeFilters,
      columns: selectedColumns,
      settings: { showGrid, showLegend, chartSize, colorScheme }
    };
    setSavedViews([...savedViews, view]);
    toast.success("View saved");
  };

  const loadView = (view: any) => {
    setChartType(view.chartType);
    setActiveFilters(view.filters);
    setSelectedColumns(view.columns);
    setShowGrid(view.settings.showGrid);
    setShowLegend(view.settings.showLegend);
    setChartSize(view.settings.chartSize);
    setColorScheme(view.settings.colorScheme);
    toast.success("View loaded");
  };

  const renderChart = () => {
    const chartData = filteredData.slice(0, 50);
    const xColumn = selectedColumns[0] || columns[0];
    const yColumn = selectedColumns[1] || numericColumns[0];
    const colors = COLORS[colorScheme as keyof typeof COLORS] || COLORS.default;

    const commonProps = {
      width: "100%",
      height: chartSize
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xColumn} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {numericColumns.slice(0, 3).map((col, idx) => (
                <Bar key={col} dataKey={col} fill={colors[idx % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xColumn} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {numericColumns.slice(0, 3).map((col, idx) => (
                <Line key={col} type="monotone" dataKey={col} stroke={colors[idx % colors.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xColumn} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {numericColumns.slice(0, 3).map((col, idx) => (
                <Area key={col} type="monotone" dataKey={col} fill={colors[idx % colors.length]} stroke={colors[idx % colors.length]} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={numericColumns[0]} name={numericColumns[0]} />
              <YAxis dataKey={numericColumns[1]} name={numericColumns[1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              {showLegend && <Legend />}
              <Scatter name="Data Points" data={chartData} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 10)}
                dataKey={yColumn}
                nameKey={xColumn}
                cx="50%"
                cy="50%"
                outerRadius={chartSize / 3}
                label
              >
                {chartData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={chartData.slice(0, 8)}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xColumn} />
              <PolarRadiusAxis />
              {numericColumns.slice(0, 3).map((col, idx) => (
                <Radar key={col} name={col} dataKey={col} stroke={colors[idx % colors.length]} fill={colors[idx % colors.length]} fillOpacity={0.6} />
              ))}
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        const funnelData = numericColumns.slice(0, 5).map(col => ({
          name: col,
          value: chartData.reduce((sum, row) => sum + (row[col] || 0), 0) / chartData.length
        }));
        return (
          <ResponsiveContainer {...commonProps}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={funnelData}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xColumn} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey={numericColumns[0]} fill={colors[0]} />
              <Line type="monotone" dataKey={numericColumns[1]} stroke={colors[1]} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center py-8">Select a chart type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Advanced Visualization Controls
            </span>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved Views ({savedViews.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Saved Views</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {savedViews.map(view => (
                      <Button
                        key={view.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => loadView(view)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {view.name}
                      </Button>
                    ))}
                    {savedViews.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No saved views yet
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={saveCurrentView}>
                <Save className="w-4 h-4 mr-2" />
                Save View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chart">Chart Type</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Standard Charts</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['bar', 'line', 'area', 'scatter', 'pie', 'radar', 'funnel', 'composed'].map(type => (
                      <Button
                        key={type}
                        variant={chartType === type ? "default" : "outline"}
                        onClick={() => setChartType(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Advanced Visualizations</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['treemap', 'heatmap', 'waterfall', 'boxplot', 'candlestick', 'gauge', 'sunburst', 'sankey'].map(type => (
                      <Button
                        key={type}
                        variant={chartType === type ? "default" : "outline"}
                        onClick={() => setChartType(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>X-Axis Column</Label>
                <Select
                  value={selectedColumns[0]}
                  onValueChange={(value) => setSelectedColumns([value, selectedColumns[1]])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Y-Axis Column</Label>
                <Select
                  value={selectedColumns[1]}
                  onValueChange={(value) => setSelectedColumns([selectedColumns[0], value])}
                >
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
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Applied Filters: {Object.keys(activeFilters).length}
              </p>
              <div className="space-y-3">
                {columns.slice(0, 5).map(column => (
                  <div key={column} className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>{column}</span>
                      {activeFilters[column] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFilters = { ...activeFilters };
                            delete newFilters[column];
                            setActiveFilters(newFilters);
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </Label>
                    {typeof data[0]?.[column] === 'number' ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          placeholder="Min value"
                          onChange={(e) => {
                            const min = parseFloat(e.target.value);
                            if (!isNaN(min)) {
                              setActiveFilters({
                                ...activeFilters,
                                [column]: { min, max: activeFilters[column]?.max || Infinity }
                              });
                            }
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Max value"
                          onChange={(e) => {
                            const max = parseFloat(e.target.value);
                            if (!isNaN(max)) {
                              setActiveFilters({
                                ...activeFilters,
                                [column]: { min: activeFilters[column]?.min || -Infinity, max }
                              });
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder={`Filter ${column}...`}
                        onChange={(e) => setActiveFilters({
                          ...activeFilters,
                          [column]: e.target.value
                        })}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveFilters({})}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label>Chart Title</Label>
                <Input
                  placeholder="Enter chart title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Chart Subtitle</Label>
                <Input
                  placeholder="Enter subtitle"
                  value={chartSubtitle}
                  onChange={(e) => setChartSubtitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="ocean">Ocean</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cool">Cool</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chart Height: {chartSize}px</Label>
                <Slider
                  value={[chartSize]}
                  onValueChange={([value]) => setChartSize(value)}
                  min={300}
                  max={800}
                  step={50}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Legend</Label>
                <Switch checked={showLegend} onCheckedChange={setShowLegend} />
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="grid gap-2">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
                <Button variant="outline" onClick={() => handleExport('png')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PNG (Coming Soon)
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Share this view
                </p>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Share Link
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Visualization Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Visualization Output</span>
            <Badge variant="secondary">
              {filteredData.length} of {data.length} rows
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.slice(0, 6).map(col => (
                    <th key={col} className="text-left p-2 font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    {columns.slice(0, 6).map(col => (
                      <td key={col} className="p-2">{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
