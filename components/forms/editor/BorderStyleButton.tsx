import { useSubscriptionLevel } from "@/components/resumes/SubscriptionLevelProvider";
import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseCustomization } from "@/lib/permissions";
import { Circle, Square, Squircle } from "lucide-react";
import React from "react";
export const BorderStyles = {
  SQUARE: "square",
  CIRCLE: "circle",
  SQUIRCLE: "squircle",
};

const borderStyles = Object.values(BorderStyles);

interface BorderStyleButtonProps {
  borderStyle: string | undefined;
  onChange: (borderStyle: string) => void;
}
const BorderStyleButton = ({
  borderStyle,
  onChange,
}: BorderStyleButtonProps) => {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  const handleClick = () => {
    if (!canUseCustomization(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    const currentIndex = borderStyle ? borderStyles.indexOf(borderStyle) : 0;
    const nextIndex = (currentIndex + 1) % borderStyles.length;
    onChange(borderStyles[nextIndex]);
  };

  const Icon =
    borderStyle === "square"
      ? Square
      : borderStyle === "circle"
        ? Circle
        : Squircle;
  return (
    <Button
      variant={"outline"}
      size={"icon"}
      onClick={handleClick}
      title="Change Border Style"
    >
      <Icon className="size-5" />
    </Button>
  );
};

export default BorderStyleButton;
