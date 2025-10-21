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

    // Perform basic statistical analysis
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
      return values.length > 0 && values.every(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    });
    
    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

    // Calculate descriptive statistics
    const descriptiveStats: any = {};
    numericColumns.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      values.sort((a, b) => a - b);
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const median = values.length % 2 === 0 
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2 
        : values[Math.floor(values.length / 2)];
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      descriptiveStats[col] = {
        mean,
        median,
        stdDev,
        min: values[0],
        max: values[values.length - 1],
        count: values.length
      };
    });

    // Perform regression analysis between numeric columns
    const regressionResults: any[] = [];
    if (numericColumns.length >= 2) {
      // Take first two numeric columns for regression
      for (let i = 0; i < Math.min(numericColumns.length - 1, 3); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 3); j++) {
          const xCol = numericColumns[i];
          const yCol = numericColumns[j];
          
          const pairs = data.map(row => ({
            x: parseFloat(row[xCol]),
            y: parseFloat(row[yCol])
          })).filter(p => !isNaN(p.x) && !isNaN(p.y));
          
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
              xColumn: xCol,
              yColumn: yCol,
              slope,
              intercept,
              rSquared,
              correlation
            });
          }
        }
      }
    }

    // Generate visualizations
    const visualizations: any[] = [];
    
    // Bar chart for first categorical vs numeric
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const catCol = categoricalColumns[0];
      const numCol = numericColumns[0];
      const grouped = data.reduce((acc: any, row) => {
        const key = row[catCol];
        if (!acc[key]) acc[key] = [];
        acc[key].push(parseFloat(row[numCol]));
        return acc;
      }, {});
      
      const chartData = Object.entries(grouped).map(([key, values]: [string, any]) => ({
        [catCol]: key,
        [numCol]: values.reduce((sum: number, v: number) => sum + v, 0) / values.length
      })).slice(0, 10);
      
      visualizations.push({
        type: 'bar',
        title: `Average ${numCol} by ${catCol}`,
        description: `Distribution of ${numCol} across different ${catCol} categories`,
        xAxis: catCol,
        yAxis: numCol,
        data: chartData
      });
    }
    
    // Line chart for first numeric column over index
    if (numericColumns.length > 0) {
      const numCol = numericColumns[0];
      const chartData = data.slice(0, 50).map((row, idx) => ({
        index: idx + 1,
        [numCol]: parseFloat(row[numCol])
      }));
      
      visualizations.push({
        type: 'line',
        title: `${numCol} Trend`,
        description: `Trend of ${numCol} over observations`,
        xAxis: 'index',
        yAxis: numCol,
        data: chartData
      });
    }
    
    // Scatter plot for regression
    if (regressionResults.length > 0) {
      const reg = regressionResults[0];
      const chartData = data.slice(0, 100).map(row => ({
        [reg.xColumn]: parseFloat(row[reg.xColumn]),
        [reg.yColumn]: parseFloat(row[reg.yColumn])
      })).filter(p => !isNaN(p[reg.xColumn]) && !isNaN(p[reg.yColumn]));
      
      visualizations.push({
        type: 'scatter',
        title: `${reg.xColumn} vs ${reg.yColumn}`,
        description: `Correlation: ${reg.correlation.toFixed(3)}, R²: ${reg.rSquared.toFixed(3)}`,
        xAxis: reg.xColumn,
        yAxis: reg.yColumn,
        data: chartData
      });
    }

    // Prepare dataset summary for AI
    const summary = {
      totalRows: data.length,
      columns: columns.length,
      numericColumns,
      categoricalColumns,
      descriptiveStats,
      regressionResults,
      sampleData: data.slice(0, 5)
    };

    // Generate AI-powered insights
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
            content: 'You are a data analyst expert. Analyze datasets and provide actionable insights in JSON format with these fields: type (trend/correlation/outlier/pattern), title, description, confidence_score (0-1).'
          },
          {
            role: 'user',
            content: `Analyze this dataset and provide 3-5 key insights:\n${JSON.stringify(summary, null, 2)}\n\nFull dataset preview:\n${JSON.stringify(data.slice(0, 20), null, 2)}`
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

    // Fallback: basic statistical insights
    if (insights.length === 0) {
      insights = [
        {
          type: 'pattern',
          title: 'Dataset Overview',
          description: `Dataset contains ${data.length} rows and ${columns.length} columns (${numericColumns.length} numeric, ${categoricalColumns.length} categorical).`,
          confidence_score: 1.0
        }
      ];
    }

    return new Response(
      JSON.stringify({ 
        insights,
        statistics: {
          descriptive: descriptiveStats,
          regression: regressionResults
        },
        visualizations
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
