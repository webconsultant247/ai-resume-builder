import { SubscriptionLevel } from "@/lib/subscriptions";

export const canCreateResume = (
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number
) => {
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,
    pro: 3,
    pro_plus: Infinity,
  };

  const maxResumes = maxResumeMap[subscriptionLevel];

  return currentResumeCount < maxResumes;
};

export const canUseAITools = (subscriptionLevel: SubscriptionLevel) => {
  return subscriptionLevel !== "free";
};

export const canUseCustomization = (subscriptionLevel: SubscriptionLevel) => {
  return subscriptionLevel === "pro_plus";
};
