"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import ResumeEditorFooter from "@/components/ResumeEditorFooter";
import ResumePreviewWrapper from "@/components/ResumePreviewWrapper";
import steps from "@/lib/steps";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const ResumeEditor = () => {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeValues>({});
  const [showSmallResumePreview, setShowSmallResumePreview] = useState(false);

  const currentStep = searchParams.get("step") ?? steps[0].key;

  const setStep = (stepKey: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("step", stepKey);
    window.history.pushState(null, "", `?${newSearchParams.toString()}`);
  };

  const FormComponent = steps.find(
    (step) => step.key === currentStep
  )?.component;

  return (
    <div className="flex flex-col grow">
      <header className="space-y-1.5 border-b py-5 px-3 text-center">
        <h1 className="text-2xl font-bold">Design Your Resume</h1>
        <p className="text-sm text-muted-foreground">
          Follow the steps below to create your resume. Your Progress will be
          saved automatically.
        </p>
      </header>
      <main className="relative grow">
        <div className="absolute top-0 bottom-0 flex w-full">
          <div
            className={cn(
              "w-full p-3 space-y-6 overflow-y-auto md:w-1/2 md:block",
              showSmallResumePreview && "hidden"
            )}
          >
            <Breadcrumbs currentStep={currentStep} setCurrentStep={setStep} />
            {FormComponent && (
              <FormComponent
                resumeData={resumeData}
                setResumeData={setResumeData}
              />
            )}
          </div>
          <div className="grow md:border-r" />
          <ResumePreviewWrapper
            resumeData={resumeData}
            setResumeData={setResumeData}
            className={cn(showSmallResumePreview && "flex")}
          />
        </div>
      </main>
      <ResumeEditorFooter
        currentStep={currentStep}
        setCurrentStep={setStep}
        showSmallResumePreview={showSmallResumePreview}
        setShowSmallResumePreview={setShowSmallResumePreview}
      />
    </div>
  );
};

export default ResumeEditor;
