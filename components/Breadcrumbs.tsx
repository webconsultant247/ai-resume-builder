import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import steps from "@/lib/steps";
import { Fragment } from "react";

interface BreadcrumbsProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
}

const Breadcrumbs = ({ currentStep, setCurrentStep }: BreadcrumbsProps) => {
  return (
    <div className="flex justify-center">
      <Breadcrumb>
        <BreadcrumbList>
          {steps.map((step) => (
            <Fragment key={step.key}>
              <BreadcrumbItem>
                {step.key === currentStep ? (
                  <BreadcrumbPage>{step.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button onClick={() => setCurrentStep(step.key)}>
                      {step.title}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="last:hidden" />
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
