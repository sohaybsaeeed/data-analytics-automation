import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, datasetId } = await req.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid or empty dataset provided');
    }

    console.log('Analyzing dataset with', data.length, 'rows');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // STEP 1: DATA CLEANING
    console.log('Step 1: Cleaning data...');
    
    // Remove duplicate rows
    const uniqueData = data.filter((row, index, self) => 
      index === self.findIndex((r) => JSON.stringify(r) === JSON.stringify(row))
    );
    console.log(`Removed ${data.length - uniqueData.length} duplicate rows`);
    
    // Get all columns
    const columns = Object.keys(uniqueData[0]);
    
    // Clean and normalize data
    const cleanedData = uniqueData.map(row => {
      const cleanedRow: any = {};
      columns.forEach(col => {
        let value = row[col];
        
        // Handle missing values
        if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'null') {
          cleanedRow[col] = null;
          return;
        }
        
        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          cleanedRow[col] = numValue;
        } else {
          // Keep as string, trim whitespace
          cleanedRow[col] = String(value).trim();
        }
      });
      return cleanedRow;
    });
    
    // Remove rows with all null values
    const validData = cleanedData.filter(row => 
      Object.values(row).some(v => v !== null)
    );
    
    console.log(`Cleaned dataset: ${validData.length} valid rows`);
    
    const dataQualityReport = {
      originalRows: data.length,
      duplicatesRemoved: data.length - uniqueData.length,
      invalidRowsRemoved: cleanedData.length - validData.length,
      finalRows: validData.length,
      missingValuesPerColumn: {} as any
    };
    
    // Count missing values per column
    columns.forEach(col => {
      const missingCount = validData.filter(row => row[col] === null).length;
      if (missingCount > 0) {
        dataQualityReport.missingValuesPerColumn[col] = {
          count: missingCount,
          percentage: ((missingCount / validData.length) * 100).toFixed(2)
        };
      }
    });

    // STEP 2: EXPLORATORY DATA ANALYSIS
    console.log('Step 2: Performing EDA...');
    
    const numericColumns = columns.filter(col => {
      const values = validData.map(row => row[col]).filter(v => v !== null);
      return values.length > 0 && values.every(v => typeof v === 'number');
    });
    
    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

    // Calculate descriptive statistics
    const descriptiveStats: any = {};
    numericColumns.forEach(col => {
      const values = validData.map(row => row[col]).filter(v => v !== null) as number[];
      if (values.length === 0) return;
      
      values.sort((a, b) => a - b);
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const median = values.length % 2 === 0 
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2 
        : values[Math.floor(values.length / 2)];
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate quartiles
      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      const q1 = values[q1Index];
      const q3 = values[q3Index];
      const iqr = q3 - q1;
      
      // Detect outliers using IQR method
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const outliers = values.filter(v => v < lowerBound || v > upperBound);
      
      descriptiveStats[col] = {
        mean,
        median,
        stdDev,
        min: values[0],
        max: values[values.length - 1],
        count: values.length,
        q1,
        q3,
        iqr,
        outlierCount: outliers.length,
        skewness: calculateSkewness(values, mean, stdDev),
        kurtosis: calculateKurtosis(values, mean, stdDev)
      };
    });
    
    // Helper functions for skewness and kurtosis
    function calculateSkewness(values: number[], mean: number, stdDev: number): number {
      if (stdDev === 0) return 0;
      const n = values.length;
      const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
      return (n * sum) / ((n - 1) * (n - 2));
    }
    
    function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
      if (stdDev === 0) return 0;
      const n = values.length;
      const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
      return (n * (n + 1) * sum) / ((n - 1) * (n - 2) * (n - 3)) - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    }

    // STEP 3: CLUSTERING ANALYSIS
    console.log('Step 3: Performing clustering...');
    
    const clusteringResults: any = {};
    if (numericColumns.length >= 2) {
      // Normalize data for clustering
      const normalizedData = validData.map(row => {
        const normalized: any = {};
        numericColumns.slice(0, 3).forEach(col => {
          const value = row[col];
          if (value !== null && descriptiveStats[col]) {
            const mean = descriptiveStats[col].mean;
            const stdDev = descriptiveStats[col].stdDev;
            normalized[col] = stdDev > 0 ? (value - mean) / stdDev : 0;
          }
        });
        return normalized;
      }).filter(row => Object.keys(row).length > 0);
      
      // K-means clustering (k=3)
      const k = Math.min(3, Math.floor(validData.length / 10));
      if (k >= 2 && normalizedData.length >= k) {
        const clusters = performKMeans(normalizedData, k, numericColumns.slice(0, 3));
        clusteringResults.method = 'K-Means';
        clusteringResults.k = k;
        clusteringResults.clusters = clusters.assignments.reduce((acc: any, cluster: number) => {
          acc[cluster] = (acc[cluster] || 0) + 1;
          return acc;
        }, {});
        clusteringResults.centroids = clusters.centroids;
        
        // Add cluster assignments to data
        validData.forEach((row, idx) => {
          if (idx < clusters.assignments.length) {
            row['cluster'] = clusters.assignments[idx];
          }
        });
      }
    }
    
    // K-means implementation
    function performKMeans(data: any[], k: number, features: string[]) {
      const maxIterations = 100;
      const centroids: any[] = [];
      
      // Initialize centroids randomly
      for (let i = 0; i < k; i++) {
        const randomIdx = Math.floor(Math.random() * data.length);
        centroids.push({ ...data[randomIdx] });
      }
      
      let assignments = new Array(data.length).fill(0);
      
      for (let iter = 0; iter < maxIterations; iter++) {
        // Assign points to nearest centroid
        const newAssignments = data.map((point, idx) => {
          let minDist = Infinity;
          let cluster = 0;
          
          centroids.forEach((centroid, cIdx) => {
            const dist = features.reduce((sum, feat) => {
              const diff = (point[feat] || 0) - (centroid[feat] || 0);
              return sum + diff * diff;
            }, 0);
            
            if (dist < minDist) {
              minDist = dist;
              cluster = cIdx;
            }
          });
          
          return cluster;
        });
        
        // Check convergence
        if (JSON.stringify(newAssignments) === JSON.stringify(assignments)) {
          break;
        }
        
        assignments = newAssignments;
        
        // Update centroids
        for (let c = 0; c < k; c++) {
          const clusterPoints = data.filter((_, idx) => assignments[idx] === c);
          if (clusterPoints.length > 0) {
            features.forEach(feat => {
              const sum = clusterPoints.reduce((s, p) => s + (p[feat] || 0), 0);
              centroids[c][feat] = sum / clusterPoints.length;
            });
          }
        }
      }
      
      return { assignments, centroids };
    }

    // STEP 4: REGRESSION ANALYSIS (Linear & Logistic)
    console.log('Step 4: Performing regression analysis...');
    
    const regressionResults: any[] = [];
    const logisticRegressionResults: any[] = [];
    
    // Linear Regression
    if (numericColumns.length >= 2) {
      for (let i = 0; i < Math.min(numericColumns.length - 1, 3); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 3); j++) {
          const xCol = numericColumns[i];
          const yCol = numericColumns[j];
          
          const pairs = validData.map(row => ({
            x: row[xCol] as number,
            y: row[yCol] as number
          })).filter(p => p.x !== null && p.y !== null);
          
          if (pairs.length > 0) {
            const n = pairs.length;
            const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
            const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
            const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0);
            const sumX2 = pairs.reduce((sum, p) => sum + p.x * p.x, 0);
            const sumY2 = pairs.reduce((sum, p) => sum + p.y * p.y, 0);
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            const meanX = sumX / n;
            const meanY = sumY / n;
            const ssTotal = pairs.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
            const ssResidual = pairs.reduce((sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
            const rSquared = 1 - (ssResidual / ssTotal);
            
            const correlation = (n * sumXY - sumX * sumY) / 
              Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            
            regressionResults.push({
              type: 'linear',
              xColumn: xCol,
              yColumn: yCol,
              slope,
              intercept,
              rSquared,
              correlation,
              equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`
            });
          }
        }
      }
    }
    
    // Logistic Regression (for binary classification)
    if (numericColumns.length >= 1) {
      // Find binary categorical columns (columns with exactly 2 unique values)
      const binaryColumns = categoricalColumns.filter(col => {
        const uniqueVals = [...new Set(validData.map(row => row[col]).filter(v => v !== null))];
        return uniqueVals.length === 2;
      });
      
      if (binaryColumns.length > 0 && numericColumns.length > 0) {
        const targetCol = binaryColumns[0];
        const featureCol = numericColumns[0];
        
        // Encode binary target as 0 and 1
        const uniqueVals = [...new Set(validData.map(row => row[targetCol]).filter(v => v !== null))];
        const pairs = validData.map(row => ({
          x: row[featureCol] as number,
          y: row[targetCol] === uniqueVals[0] ? 0 : 1
        })).filter(p => p.x !== null && p.y !== null && !isNaN(p.y));
        
        if (pairs.length > 10) {
          // Simple logistic regression using gradient descent
          let w = 0; // weight
          let b = 0; // bias
          const learningRate = 0.01;
          const iterations = 1000;
          
          // Normalize features
          const xValues = pairs.map(p => p.x);
          const xMean = xValues.reduce((sum, v) => sum + v, 0) / xValues.length;
          const xStd = Math.sqrt(xValues.reduce((sum, v) => sum + Math.pow(v - xMean, 2), 0) / xValues.length);
          
          const normalizedPairs = pairs.map(p => ({
            x: xStd > 0 ? (p.x - xMean) / xStd : 0,
            y: p.y
          }));
          
          // Gradient descent
          for (let iter = 0; iter < iterations; iter++) {
            let gradW = 0;
            let gradB = 0;
            
            for (const p of normalizedPairs) {
              const z = w * p.x + b;
              const pred = 1 / (1 + Math.exp(-z)); // sigmoid
              const error = pred - p.y;
              gradW += error * p.x;
              gradB += error;
            }
            
            w -= (learningRate * gradW) / normalizedPairs.length;
            b -= (learningRate * gradB) / normalizedPairs.length;
          }
          
          // Calculate accuracy
          let correct = 0;
          normalizedPairs.forEach(p => {
            const z = w * p.x + b;
            const pred = 1 / (1 + Math.exp(-z));
            const predClass = pred >= 0.5 ? 1 : 0;
            if (predClass === p.y) correct++;
          });
          const accuracy = correct / normalizedPairs.length;
          
          logisticRegressionResults.push({
            type: 'logistic',
            featureColumn: featureCol,
            targetColumn: targetCol,
            weight: w,
            bias: b,
            accuracy,
            classes: uniqueVals,
            interpretation: `Predicting ${targetCol} based on ${featureCol} with ${(accuracy * 100).toFixed(1)}% accuracy`
          });
        }
      }
    }

    // STEP 5: GENERATE MULTIPLE VISUALIZATION OPTIONS
    console.log('Step 5: Generating visualizations...');
    
    const visualizations: any[] = [];
    
    // Categorical vs Numeric: multiple chart types
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const catCol = categoricalColumns.filter(c => c !== 'cluster')[0];
      const numCol = numericColumns[0];
      const grouped = validData.reduce((acc: any, row) => {
        const key = row[catCol];
        if (!acc[key]) acc[key] = [];
        const value = row[numCol];
        if (value !== null) acc[key].push(value);
        return acc;
      }, {});
      
      const chartData = Object.entries(grouped).map(([key, values]: [string, any]) => ({
        [catCol]: key,
        [numCol]: values.reduce((sum: number, v: number) => sum + v, 0) / values.length,
        count: values.length
      })).slice(0, 10);
      
      // Bar chart
      visualizations.push({
        type: 'bar',
        availableTypes: ['bar', 'line', 'area', 'pie'],
        title: `Average ${numCol} by ${catCol}`,
        description: `Distribution of ${numCol} across different ${catCol} categories`,
        xAxis: catCol,
        yAxis: numCol,
        data: chartData
      });
    }
    
    // Time series / trend data: multiple chart types
    if (numericColumns.length > 0) {
      const numCol = numericColumns[0];
      const chartData = validData.slice(0, 50).map((row, idx) => ({
        index: idx + 1,
        [numCol]: row[numCol]
      })).filter(d => d[numCol] !== null);
      
      visualizations.push({
        type: 'line',
        availableTypes: ['line', 'area', 'bar'],
        title: `${numCol} Trend`,
        description: `Trend of ${numCol} over observations`,
        xAxis: 'index',
        yAxis: numCol,
        data: chartData
      });
    }
    
    // Scatter plot with regression line
    if (regressionResults.length > 0) {
      const reg = regressionResults[0];
      const chartData = validData.slice(0, 100).map(row => ({
        [reg.xColumn]: row[reg.xColumn],
        [reg.yColumn]: row[reg.yColumn],
        cluster: row['cluster']
      })).filter(p => p[reg.xColumn] !== null && p[reg.yColumn] !== null);
      
      visualizations.push({
        type: 'scatter',
        availableTypes: ['scatter', 'line'],
        title: `${reg.xColumn} vs ${reg.yColumn}`,
        description: `Correlation: ${reg.correlation.toFixed(3)}, R²: ${reg.rSquared.toFixed(3)}`,
        xAxis: reg.xColumn,
        yAxis: reg.yColumn,
        data: chartData
      });
    }
    
    // Distribution chart for numeric columns
    if (numericColumns.length > 0) {
      const numCol = numericColumns[0];
      const values = validData.map(row => row[numCol]).filter(v => v !== null) as number[];
      
      // Create histogram bins
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = Math.min(10, Math.floor(values.length / 5));
      const binSize = (max - min) / binCount;
      const bins: any = {};
      
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
        bins[binLabel] = values.filter(v => v >= binStart && v < binEnd).length;
      }
      
      const histogramData = Object.entries(bins).map(([range, count]) => ({
        range,
        frequency: count
      }));
      
      visualizations.push({
        type: 'bar',
        availableTypes: ['bar', 'area'],
        title: `${numCol} Distribution`,
        description: `Frequency distribution of ${numCol}`,
        xAxis: 'range',
        yAxis: 'frequency',
        data: histogramData
      });
    }

    // Prepare comprehensive dataset summary for AI with ML recommendations
    const summary = {
      dataQuality: dataQualityReport,
      totalRows: validData.length,
      columns: columns.length,
      numericColumns,
      categoricalColumns,
      descriptiveStats,
      clustering: clusteringResults,
      linearRegression: regressionResults,
      logisticRegression: logisticRegressionResults,
      sampleData: validData.slice(0, 5)
    };

    // STEP 6: GENERATE AI-POWERED INSIGHTS
    console.log('Step 6: Generating AI insights...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a data scientist and machine learning expert. Analyze datasets with advanced statistical methods, clustering, and regression models. Provide actionable insights and recommend appropriate ML/DL models for the data. Consider: data patterns, model suitability (classification, regression, clustering), feature importance, and prediction accuracy. Format: type (trend/correlation/outlier/pattern/cluster/model_recommendation), title, description, confidence_score (0-1).'
          },
          {
            role: 'user',
            content: `Analyze this comprehensive dataset and provide 5-8 key insights including ML/DL model recommendations:\n\n1. Data Quality: ${JSON.stringify(summary.dataQuality, null, 2)}\n\n2. Statistics: ${JSON.stringify(summary.descriptiveStats, null, 2)}\n\n3. Clustering: ${JSON.stringify(summary.clustering, null, 2)}\n\n4. Linear Regression: ${JSON.stringify(summary.linearRegression, null, 2)}\n\n5. Logistic Regression: ${JSON.stringify(summary.logisticRegression, null, 2)}\n\n6. Sample Data: ${JSON.stringify(validData.slice(0, 10), null, 2)}\n\nRecommend the best ML/DL models (e.g., Random Forest, Neural Networks, SVM, Decision Trees) for this dataset based on its characteristics.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_insights",
            description: "Generate data insights",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["trend", "correlation", "outlier", "pattern"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      confidence_score: { type: "number", minimum: 0, maximum: 1 }
                    },
                    required: ["type", "title", "description", "confidence_score"]
                  }
                }
              },
              required: ["insights"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_insights" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiResult, null, 2));

    let insights = [];
    
    // Extract insights from tool call
    if (aiResult.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = JSON.parse(aiResult.choices[0].message.tool_calls[0].function.arguments);
      insights = args.insights || [];
    }

    // Fallback: basic insights from preprocessing
    if (insights.length === 0) {
      insights = [
        {
          type: 'pattern',
          title: 'Data Quality Overview',
          description: `Dataset cleaned from ${dataQualityReport.originalRows} to ${dataQualityReport.finalRows} rows. Removed ${dataQualityReport.duplicatesRemoved} duplicates and ${dataQualityReport.invalidRowsRemoved} invalid rows. Contains ${numericColumns.length} numeric and ${categoricalColumns.length} categorical columns.`,
          confidence_score: 1.0
        }
      ];
      
      if (Object.keys(clusteringResults).length > 0) {
        insights.push({
          type: 'cluster',
          title: 'Clustering Analysis',
          description: `K-means clustering identified ${clusteringResults.k} distinct groups in the data. Cluster distribution: ${JSON.stringify(clusteringResults.clusters)}`,
          confidence_score: 0.85
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        insights,
        dataQuality: dataQualityReport,
        statistics: {
          descriptive: descriptiveStats,
          linearRegression: regressionResults,
          logisticRegression: logisticRegressionResults,
          clustering: clusteringResults
        },
        visualizations,
        cleanedDataSample: validData.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-dataset:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
