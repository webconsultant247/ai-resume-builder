"use client";

import { SubscriptionLevel } from "@/lib/subscriptions";
import { createContext, useContext } from "react";

const SubscriptionLevelContext = createContext<SubscriptionLevel | undefined>(
  undefined
);

interface SubscriptionLevelProviderProps {
  children: React.ReactNode;
  userSubscriptionLevel: SubscriptionLevel;
}

export const SubscriptionLevelProvider = ({
  children,
  userSubscriptionLevel,
}: SubscriptionLevelProviderProps) => {
  return (
    <SubscriptionLevelContext.Provider value={userSubscriptionLevel}>
      {children}
    </SubscriptionLevelContext.Provider>
  );
};

export default SubscriptionLevelProvider;

export const useSubscriptionLevel = () => {
  const context = useContext(SubscriptionLevelContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptionLevel must be used within a SubscriptionLevelProvider"
    );
  }

  return context;
};
