import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, User } from "lucide-react";

interface DataOrganizationDialogProps {
  open: boolean;
  onChoice: (choice: 'ai' | 'manual') => void;
}

const DataOrganizationDialog = ({ open, onChoice }: DataOrganizationDialogProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How would you like to organize your data?</DialogTitle>
          <DialogDescription>
            Choose whether you want to manually organize your data or let AI automatically organize it for optimal analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => onChoice('ai')}
            className="h-24 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Brain className="w-8 h-8" />
            <div>
              <div className="font-semibold">Let AI Organize</div>
              <div className="text-xs text-muted-foreground">Automatic optimization</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onChoice('manual')}
            className="h-24 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <User className="w-8 h-8" />
            <div>
              <div className="font-semibold">Organize Manually</div>
              <div className="text-xs text-muted-foreground">Full control over data</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataOrganizationDialog;
