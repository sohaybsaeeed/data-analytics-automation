import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client as PostgresClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabaseConfig {
  dbType: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  query: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config: DatabaseConfig = await req.json();
    console.log(`Connecting to ${config.dbType} database at ${config.host}:${config.port}`);

    // Validate required fields
    if (!config.host || !config.database || !config.username || !config.password) {
      throw new Error('Missing required connection parameters');
    }

    // Validate query to prevent dangerous operations
    const queryLower = config.query.toLowerCase().trim();
    if (queryLower.includes('drop ') || 
        queryLower.includes('delete ') || 
        queryLower.includes('truncate ') ||
        queryLower.includes('insert ') ||
        queryLower.includes('update ') ||
        queryLower.includes('create ') ||
        queryLower.includes('alter ')) {
      throw new Error('Only SELECT queries are allowed for data import');
    }

    let rows: any[] = [];

    // Handle PostgreSQL connections
    if (config.dbType === 'postgresql') {
      const client = new PostgresClient({
        user: config.username,
        password: config.password,
        database: config.database,
        hostname: config.host,
        port: parseInt(config.port || '5432'),
      });

      try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
        
        const result = await client.queryObject(config.query);
        rows = result.rows;
        
        console.log(`Query returned ${rows.length} rows`);
      } finally {
        await client.end();
      }
    } 
    // Handle MySQL connections
    else if (config.dbType === 'mysql') {
      // For MySQL, we'll use a different approach with Deno's native fetch to a MySQL REST API
      // In production, you'd want to use a proper MySQL driver
      throw new Error('MySQL connections coming soon. Please use PostgreSQL for now.');
    }
    // Handle SQL Server connections
    else if (config.dbType === 'sqlserver') {
      throw new Error('SQL Server connections coming soon. Please use PostgreSQL for now.');
    }
    else {
      throw new Error(`Unsupported database type: ${config.dbType}`);
    }

    // Limit rows to prevent memory issues
    if (rows.length > 10000) {
      console.log(`Limiting results from ${rows.length} to 10000 rows`);
      rows = rows.slice(0, 10000);
    }

    return new Response(
      JSON.stringify({
        success: true,
        rows,
        count: rows.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to database';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
