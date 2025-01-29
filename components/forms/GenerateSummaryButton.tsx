import { generateSummary } from "@/actions";
import LoadingButton from "@/components/forms/LoadingButton";
import { useSubscriptionLevel } from "@/components/resumes/SubscriptionLevelProvider";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
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
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    //Todo: Implement the AI summary generation logic here for premium users
    if (!canUseAITools(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }
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
