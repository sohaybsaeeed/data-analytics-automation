import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database, Code, FileSpreadsheet } from "lucide-react";

interface ManualOrganizationMethodProps {
  open: boolean;
  onChoice: (method: 'sql' | 'python' | 'excel') => void;
}

const ManualOrganizationMethod = ({ open, onChoice }: ManualOrganizationMethodProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Data Organization Method</DialogTitle>
          <DialogDescription>
            Select how you'd like to manually organize your data
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => onChoice('sql')}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Database className="w-8 h-8" />
            <div>
              <div className="font-semibold">SQL Editor</div>
              <div className="text-xs text-muted-foreground">Query and transform with SQL</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onChoice('python')}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Code className="w-8 h-8" />
            <div>
              <div className="font-semibold">Python Script</div>
              <div className="text-xs text-muted-foreground">Download Python notebook</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onChoice('excel')}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileSpreadsheet className="w-8 h-8" />
            <div>
              <div className="font-semibold">Excel Editor</div>
              <div className="text-xs text-muted-foreground">Download and re-upload</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualOrganizationMethod;
