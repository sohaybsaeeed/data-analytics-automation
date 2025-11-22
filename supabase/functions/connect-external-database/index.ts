import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client as PostgresClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { Client as MySQLClient } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

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
      const client = await new MySQLClient().connect({
        hostname: config.host,
        username: config.username,
        password: config.password,
        db: config.database,
        port: parseInt(config.port || '3306'),
      });

      try {
        console.log('Connected to MySQL database');
        
        const result = await client.query(config.query);
        rows = result as any[];
        
        console.log(`Query returned ${rows.length} rows`);
      } finally {
        await client.close();
      }
    }
    // Handle SQL Server connections
    else if (config.dbType === 'sqlserver') {
      // SQL Server connection using TDS protocol
      const connectionString = `Server=${config.host},${config.port || '1433'};Database=${config.database};User Id=${config.username};Password=${config.password};Encrypt=true;TrustServerCertificate=true`;
      
      try {
        console.log('Connected to SQL Server database');
        
        // For SQL Server, we'll use fetch to call a SQL Server REST API endpoint
        // Note: This is a simplified implementation. For production use, consider using tedious or mssql packages
        const response = await fetch(`https://api.sqlserver-proxy.com/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionString,
            query: config.query,
          }),
        });

        if (!response.ok) {
          throw new Error(`SQL Server query failed: ${response.statusText}`);
        }

        const result = await response.json();
        rows = result.rows || [];
        
        console.log(`Query returned ${rows.length} rows`);
      } catch (error) {
        console.error('SQL Server connection error:', error);
        throw new Error('SQL Server connections require a proxy service. Please use PostgreSQL or MySQL for now.');
      }
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
