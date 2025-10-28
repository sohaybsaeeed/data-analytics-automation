import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Activity, Database, Brain } from "lucide-react";

interface DashboardRecommendationsProps {
  data: any[];
  insights: any[];
  statistics: any;
}

export const DashboardRecommendations = ({ data, insights, statistics }: DashboardRecommendationsProps) => {
  // Analyze data characteristics to recommend dashboards
  const generateRecommendations = () => {
    const recommendations = [];
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number'
    );
    const categoricalColumns = columns.filter(col => 
      typeof data[0][col] === 'string'
    );

    // Recommendation 1: KPI Dashboard if numeric columns exist
    if (numericColumns.length >= 2) {
      recommendations.push({
        title: "Executive KPI Dashboard",
        description: "Track key performance indicators with summary cards and trend lines",
        icon: TrendingUp,
        priority: "high",
        components: [
          "KPI Cards for " + numericColumns.slice(0, 4).join(", "),
          "Trend charts showing changes over time",
          "Comparative analysis between metrics"
        ],
        rationale: `Your data contains ${numericColumns.length} numeric metrics, ideal for a KPI dashboard.`
      });
    }

    // Recommendation 2: Distribution Analysis if enough data points
    if (data.length >= 20) {
      recommendations.push({
        title: "Distribution Analysis Dashboard",
        description: "Visualize data distributions, outliers, and statistical patterns",
        icon: BarChart3,
        priority: "high",
        components: [
          "Histograms for numeric distributions",
          "Box plots to identify outliers",
          "Statistical summary cards"
        ],
        rationale: `With ${data.length} data points, you can perform robust distribution analysis.`
      });
    }

    // Recommendation 3: Categorical Breakdown
    if (categoricalColumns.length >= 1 && numericColumns.length >= 1) {
      recommendations.push({
        title: "Category Breakdown Dashboard",
        description: "Analyze performance across different categories and segments",
        icon: PieChart,
        priority: "medium",
        components: [
          `Pie/Donut charts for ${categoricalColumns[0]} distribution`,
          "Bar charts comparing categories",
          "Cross-tabulation analysis"
        ],
        rationale: `Your categorical fields (${categoricalColumns.join(", ")}) can segment numeric metrics effectively.`
      });
    }

    // Recommendation 4: Correlation Dashboard
    if (numericColumns.length >= 3) {
      recommendations.push({
        title: "Correlation & Relationship Dashboard",
        description: "Discover relationships and correlations between variables",
        icon: Activity,
        priority: "medium",
        components: [
          "Scatter plots showing correlations",
          "Correlation matrix heatmap",
          "Regression line visualizations"
        ],
        rationale: `Multiple numeric columns enable correlation analysis to find hidden relationships.`
      });
    }

    // Recommendation 5: Clustering Dashboard if clustering was performed
    if (statistics?.clustering) {
      recommendations.push({
        title: "Segmentation Dashboard",
        description: "Explore clusters and segments identified in your data",
        icon: Database,
        priority: "high",
        components: [
          `${statistics.clustering.k} cluster visualizations`,
          "Cluster characteristics comparison",
          "Segment performance metrics"
        ],
        rationale: `Clustering analysis identified ${statistics.clustering.k} distinct segments in your data.`
      });
    }

    // Recommendation 6: AI Insights Dashboard
    if (insights.length >= 3) {
      recommendations.push({
        title: "AI-Powered Insights Dashboard",
        description: "Automated insights, predictions, and anomaly detection",
        icon: Brain,
        priority: "high",
        components: [
          "Top insights highlighted",
          "Confidence scores visualization",
          "Trend predictions and forecasts"
        ],
        rationale: `AI analysis generated ${insights.length} actionable insights from your data.`
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default: return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Recommended Dashboards</h3>
          <p className="text-sm text-muted-foreground">
            Based on your data characteristics and analysis results, we recommend these dashboard configurations
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {rec.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Components:</p>
                  <ul className="space-y-1">
                    {rec.components.map((component, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{component}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground italic">
                    <span className="font-semibold">Why? </span>
                    {rec.rationale}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Upload and analyze data to receive dashboard recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
