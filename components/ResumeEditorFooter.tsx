import { Button } from "@/components/ui/button";
import steps from "@/lib/steps";
import { cn } from "@/lib/utils";
import { FileUserIcon, PenLineIcon, X } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResumeEditorFooterProps {
  currentStep: string;
  setCurrentStep: (stepKey: string) => void;
  showSmallResumePreview: boolean;
  setShowSmallResumePreview: (show: boolean) => void;
  isSaving: boolean;
}

const ResumeEditorFooter = ({
  currentStep,
  setCurrentStep,
  showSmallResumePreview,
  setShowSmallResumePreview,
  isSaving,
}: ResumeEditorFooterProps) => {
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep
  )?.key;
  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep
  )?.key;

  return (
    <footer className="w-full px-3 py-5 border-t">
      <div className="flex flex-wrap justify-between gap-3 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Button
            onClick={
              previousStep ? () => setCurrentStep(previousStep) : undefined
            }
            disabled={!previousStep}
            variant={"secondary"}
          >
            Previous Step
          </Button>
          <Button
            disabled={!nextStep}
            onClick={nextStep ? () => setCurrentStep(nextStep) : undefined}
          >
            Next Step
          </Button>
        </div>
        <Button
          variant={"outline"}
          size={"icon"}
          className="md:hidden"
          onClick={() => setShowSmallResumePreview(!showSmallResumePreview)}
          title={
            showSmallResumePreview ? "Show Input Form" : "Show Resume Preview"
          }
        >
          {showSmallResumePreview ? <PenLineIcon /> : <FileUserIcon />}
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant={"secondary"}
            className="flex items-center gap-0.5"
            asChild
          >
            <Link href={"/resumes"}>
              <X />
              Close
            </Link>
          </Button>
          <p
            className={cn(
              "text-muted-foreground",
              isSaving ? "opacity-100" : "opacity-0"
            )}
          >
            Saving...
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ResumeEditorFooter;
