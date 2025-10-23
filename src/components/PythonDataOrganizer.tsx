import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";

interface PythonDataOrganizerProps {
  data: any[];
  fileName: string;
  onConfirm: (organizedData: any[]) => void;
}

const PythonDataOrganizer = ({ data, fileName, onConfirm }: PythonDataOrganizerProps) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const pythonScript = `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load your data
df = pd.read_csv('${fileName.replace(/\.(xlsx|xls)$/, '.csv')}')

# Data exploration
print("Dataset shape:", df.shape)
print("\\nColumn names:", df.columns.tolist())
print("\\nData types:\\n", df.dtypes)
print("\\nFirst few rows:\\n", df.head())
print("\\nBasic statistics:\\n", df.describe())
print("\\nMissing values:\\n", df.isnull().sum())

# Example data transformations (modify as needed):

# 1. Remove duplicates
df = df.drop_duplicates()

# 2. Handle missing values
# df = df.dropna()  # Remove rows with missing values
# df = df.fillna(0)  # Fill missing values with 0
# df = df.fillna(df.mean())  # Fill with column mean (numeric columns only)

# 3. Filter rows
# df = df[df['${columns[0]}'] > 0]  # Example: filter rows where ${columns[0]} > 0

# 4. Select specific columns
# df = df[['${columns.slice(0, 3).join("', '")}']]

# 5. Create new calculated columns
# df['new_column'] = df['${columns[0]}'] * 2

# 6. Sort data
# df = df.sort_values('${columns[0]}', ascending=False)

# 7. Group and aggregate
# df_grouped = df.groupby('${columns[0]}').agg({'${columns[1] || 'column'}': 'mean'}).reset_index()

# Visualization examples
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
df['${columns[0]}'].hist(bins=20)
plt.title('${columns[0]} Distribution')
plt.xlabel('${columns[0]}')
plt.ylabel('Frequency')

if len(df.select_dtypes(include=[np.number]).columns) >= 2:
    plt.subplot(1, 2, 2)
    numeric_cols = df.select_dtypes(include=[np.number]).columns[:2]
    plt.scatter(df[numeric_cols[0]], df[numeric_cols[1]], alpha=0.5)
    plt.title(f'{numeric_cols[0]} vs {numeric_cols[1]}')
    plt.xlabel(numeric_cols[0])
    plt.ylabel(numeric_cols[1])

plt.tight_layout()
plt.savefig('data_visualization.png')
plt.show()

# Save the organized data
df.to_csv('organized_data.csv', index=False)
print("\\nOrganized data saved to 'organized_data.csv'")
print("Final shape:", df.shape)
`;

  const downloadPythonScript = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organize_data.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Python script downloaded! Run it to organize your data.");
  };

  const downloadCSV = () => {
    const csv = [
      columns.join(','),
      ...data.map(row => columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.(xlsx|xls)$/, '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        const organizedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: any = {};
          headers.forEach((header, idx) => {
            const value = values[idx];
            const numValue = parseFloat(value);
            row[header] = !isNaN(numValue) && isFinite(numValue) ? numValue : value;
          });
          return row;
        });

        onConfirm(organizedData);
        toast.success(`Uploaded ${organizedData.length} organized rows`);
      } catch (error: any) {
        toast.error(`Error parsing file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Python Data Organizer</CardTitle>
        <CardDescription>
          Download Python script and CSV, organize your data, then upload the result
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Step 1: Download Files</h4>
            <div className="flex gap-2">
              <Button onClick={downloadPythonScript} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Python Script
              </Button>
              <Button onClick={downloadCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Data
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 2: Run Python Script</h4>
            <p className="text-sm text-muted-foreground">
              Open the Python script in Jupyter Notebook or your IDE, modify as needed, and run it.
              The script will create an 'organized_data.csv' file.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 3: Upload Organized Data</h4>
            <label htmlFor="organized-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload organized CSV
                </p>
              </div>
              <input
                id="organized-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PythonDataOrganizer;
