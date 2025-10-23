import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Play, Check } from "lucide-react";
import alasql from 'alasql';

interface SQLDataOrganizerProps {
  data: any[];
  onConfirm: (organizedData: any[]) => void;
}

const SQLDataOrganizer = ({ data, onConfirm }: SQLDataOrganizerProps) => {
  const [sqlQuery, setSqlQuery] = useState(`-- Example queries:
-- SELECT * FROM data WHERE column_name > 100
-- SELECT column1, column2, AVG(column3) as avg_value FROM data GROUP BY column1
-- SELECT * FROM data ORDER BY column_name DESC LIMIT 10

SELECT * FROM data`);
  const [result, setResult] = useState<any[] | null>(null);
  const [executing, setExecuting] = useState(false);

  const executeQuery = () => {
    setExecuting(true);
    try {
      // Create temporary table with the data
      alasql('CREATE TABLE IF NOT EXISTS data');
      alasql('DELETE FROM data');
      data.forEach(row => {
        alasql('INSERT INTO data VALUES ?', [row]);
      });

      // Execute user query
      const queryResult = alasql(sqlQuery);
      setResult(Array.isArray(queryResult) ? queryResult : [queryResult]);
      toast.success(`Query executed successfully! ${Array.isArray(queryResult) ? queryResult.length : 1} rows returned.`);
    } catch (error: any) {
      toast.error(`SQL Error: ${error.message}`);
      setResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleConfirm = () => {
    if (result && result.length > 0) {
      onConfirm(result);
    } else {
      toast.error("Please execute a query first");
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>SQL Data Organizer</CardTitle>
        <CardDescription>
          Write SQL queries to filter, transform, and organize your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">SQL Query</label>
          <Textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
            placeholder="Enter your SQL query..."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={executeQuery} disabled={executing}>
            <Play className="w-4 h-4 mr-2" />
            {executing ? "Executing..." : "Execute Query"}
          </Button>
          
          {result && result.length > 0 && (
            <Button onClick={handleConfirm} variant="default">
              <Check className="w-4 h-4 mr-2" />
              Confirm & Continue
            </Button>
          )}
        </div>

        {result && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">Query Result ({result.length} rows)</h4>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    {Object.keys(result[0] || {}).map(key => (
                      <th key={key} className="p-2 text-left font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b">
                      {Object.values(row).map((val: any, i) => (
                        <td key={i} className="p-2">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing first 10 of {result.length} rows
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SQLDataOrganizer;
