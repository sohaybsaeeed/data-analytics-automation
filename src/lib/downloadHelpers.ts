import Papa from "papaparse";

export const downloadCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadInsightsReport = (insights: any[], statistics: any, dataQuality: any, visualizations: any[]) => {
  const reportData = [];
  
  // Add header
  reportData.push(['AI INSIGHTS REPORT', '', '', '']);
  reportData.push(['Generated on:', new Date().toLocaleString(), '', '']);
  reportData.push(['', '', '', '']);
  
  // Data Quality Section
  reportData.push(['=== DATA QUALITY REPORT ===', '', '', '']);
  if (dataQuality) {
    reportData.push(['Original Rows', dataQuality.originalRows, '', '']);
    reportData.push(['Duplicates Removed', dataQuality.duplicatesRemoved, '', '']);
    reportData.push(['Invalid Rows Removed', dataQuality.invalidRowsRemoved, '', '']);
    reportData.push(['Final Valid Rows', dataQuality.finalRows, '', '']);
    reportData.push(['', '', '', '']);
  }
  
  // Insights Section
  reportData.push(['=== AI-GENERATED INSIGHTS ===', '', '', '']);
  reportData.push(['Type', 'Title', 'Description', 'Confidence Score']);
  insights.forEach(insight => {
    reportData.push([
      insight.type || 'N/A',
      insight.title || 'N/A',
      insight.description || 'N/A',
      insight.confidence_score ? (insight.confidence_score * 100).toFixed(0) + '%' : 'N/A'
    ]);
  });
  reportData.push(['', '', '', '']);
  
  // Statistics Section
  if (statistics?.descriptive) {
    reportData.push(['=== DESCRIPTIVE STATISTICS ===', '', '', '']);
    reportData.push(['Column', 'Mean', 'Median', 'Std Dev']);
    Object.entries(statistics.descriptive).forEach(([column, stats]: [string, any]) => {
      reportData.push([
        column,
        stats.mean?.toFixed(2) || 'N/A',
        stats.median?.toFixed(2) || 'N/A',
        stats.stdDev?.toFixed(2) || 'N/A'
      ]);
    });
    reportData.push(['', '', '', '']);
  }
  
  // Linear Regression Section
  if (statistics?.linearRegression && statistics.linearRegression.length > 0) {
    reportData.push(['=== LINEAR REGRESSION MODELS ===', '', '', '']);
    reportData.push(['X Column', 'Y Column', 'Equation', 'R²']);
    statistics.linearRegression.forEach((reg: any) => {
      reportData.push([
        reg.xColumn,
        reg.yColumn,
        reg.equation,
        reg.rSquared?.toFixed(3) || 'N/A'
      ]);
    });
    reportData.push(['', '', '', '']);
  }
  
  // Clustering Section
  if (statistics?.clustering) {
    reportData.push(['=== CLUSTERING ANALYSIS ===', '', '', '']);
    reportData.push(['Method', statistics.clustering.method, '', '']);
    reportData.push(['Number of Clusters', statistics.clustering.k, '', '']);
    reportData.push(['', '', '', '']);
    reportData.push(['Cluster', 'Count', '', '']);
    Object.entries(statistics.clustering.clusters || {}).forEach(([cluster, count]: [string, any]) => {
      reportData.push([`Cluster ${parseInt(cluster) + 1}`, count, '', '']);
    });
    reportData.push(['', '', '', '']);
  }
  
  // Visualizations Summary
  reportData.push(['=== VISUALIZATIONS SUMMARY ===', '', '', '']);
  reportData.push(['Title', 'Type', 'Description', '']);
  visualizations.forEach(viz => {
    reportData.push([
      viz.title || 'N/A',
      viz.type || 'N/A',
      viz.description || 'N/A',
      ''
    ]);
  });
  
  downloadCSV(reportData, 'ai-insights-report.csv');
};
