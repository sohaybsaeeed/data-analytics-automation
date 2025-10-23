import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelDataOrganizerProps {
  data: any[];
  fileName: string;
  onConfirm: (organizedData: any[]) => void;
}

const ExcelDataOrganizer = ({ data, fileName, onConfirm }: ExcelDataOrganizerProps) => {
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Add some styling information in comments
    worksheet['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
    
    XLSX.writeFile(workbook, fileName.replace(/\.(csv)$/, '.xlsx'));
    toast.success("Excel file downloaded! Edit it and re-upload when ready.");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const organizedData = XLSX.utils.sheet_to_json(worksheet);
        
        if (organizedData.length === 0) {
          toast.error("No data found in Excel file");
          return;
        }

        onConfirm(organizedData);
        toast.success(`Uploaded ${organizedData.length} organized rows`);
      } catch (error: any) {
        toast.error(`Error parsing Excel: ${error.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Excel Data Organizer</CardTitle>
        <CardDescription>
          Download Excel file, organize your data, then upload it back
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Step 1: Download Excel File</h4>
            <Button onClick={downloadExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Excel File
            </Button>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 2: Edit in Excel</h4>
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">You can:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Add, remove, or rename columns</li>
                <li>Filter and sort data</li>
                <li>Use Excel formulas to create calculated fields</li>
                <li>Remove unwanted rows</li>
                <li>Format data as needed</li>
                <li>Create pivot tables and use them as source data</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Save your changes and re-upload the file below.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 3: Upload Organized Data</h4>
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload organized Excel file
                </p>
              </div>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Note: Make sure your Excel file contains headers in the first row and data starts from the second row.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelDataOrganizer;
