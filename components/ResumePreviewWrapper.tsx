import BorderStyleButton from "@/components/forms/editor/BorderStyleButton";
import ColorPicker from "@/components/forms/editor/ColorPicker";
import ResumePreview from "@/components/ResumePreview";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
  className?: string;
}
const ResumePreviewWrapper = ({
  resumeData,
  setResumeData,
  className,
}: ResumePreviewProps) => {
  return (
    <div
      className={cn("group relative hidden md:w-1/2 md:flex w-full", className)}
    >
      <div className="opacity-50 xl:opacity-100 transition-opacity duration-300 group-hover:opacity-100 absolute left-1 top-1 flex flex-col gap-3 flex-none lg:left-3 lg:top-3">
        <ColorPicker
          color={resumeData.colorHex}
          onChange={(color) =>
            setResumeData({ ...resumeData, colorHex: color.hex })
          }
        />
        <BorderStyleButton
          borderStyle={resumeData.borderStyle}
          onChange={(borderStyle) =>
            setResumeData({ ...resumeData, borderStyle })
          }
        />
      </div>
      <div className="flex w-full justify-center overflow-y-auto bg-secondary p-3">
        <ResumePreview
          resumeData={resumeData}
          className="max-w-2xl shadow-md"
        />
      </div>
    </div>
  );
};

export default ResumePreviewWrapper;
