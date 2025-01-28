import { generateSummary } from "@/actions";
import LoadingButton from "@/components/forms/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { ResumeValues } from "@/lib/validation";
import { WandSparkles } from "lucide-react";
import React, { useState } from "react";

interface GenerateSummaryButtonProps {
  resumeData: ResumeValues;
  onSummaryGenerated: (summary: string) => void;
}

const GenerateSummaryButton = ({
  resumeData,
  onSummaryGenerated,
}: GenerateSummaryButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    //Todo: Implement the AI summary generation logic here for premium users

    try {
      setLoading(true);
      const aiResponse = await generateSummary(resumeData);

      onSummaryGenerated(aiResponse);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong, AI failed to generate summary.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton
      variant={"outline"}
      type="button"
      loading={loading}
      onClick={handleClick}
    >
      <WandSparkles className="size-5" /> Generate (AI)
    </LoadingButton>
  );
};

export default GenerateSummaryButton;
