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
    const numericColumns = columns.filter(col => 
      data.every(row => !isNaN(parseFloat(row[col])) && isFinite(row[col]))
    );
    
    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

    // Prepare dataset summary for AI
    const summary = {
      totalRows: data.length,
      columns: columns.length,
      numericColumns,
      categoricalColumns,
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
      JSON.stringify({ insights }),
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
