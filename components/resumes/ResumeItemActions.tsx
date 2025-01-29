import DeleteConfirmationDialog from "@/components/resumes/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Printer, Trash2 } from "lucide-react";
import { useState } from "react";

interface ResumeItemActionsProps {
  resumeId: string;
  onPrintClick: () => void;
}

const ResumeItemActions = ({
  resumeId,
  onPrintClick,
}: ResumeItemActionsProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  console.log(showDeleteConfirmation);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            size="icon"
            className="absolute right-0.5 top-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setShowDeleteConfirmation(true)}
            className="flex items-enter gap-2"
          >
            <Trash2 className="size-4 text-primary" /> Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onPrintClick}
            className="flex items-center gap-2"
          >
            <Printer className="size-4 text-primary" /> Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
};

export default ResumeItemActions;
