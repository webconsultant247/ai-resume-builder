import MainNavbar from "@/components/main/Navbar";
import PremiumModal from "@/components/premium/PremiumModal";
import SubscriptionLevelProvider from "@/components/resumes/SubscriptionLevelProvider";
import { getUserSubscriptionLevel } from "@/lib/subscriptions";
import { auth } from "@clerk/nextjs/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const userSubscription = await getUserSubscriptionLevel(userId);
  return (
    <SubscriptionLevelProvider userSubscriptionLevel={userSubscription}>
      <div className="flex flex-col min-h-screen">
        <MainNavbar />
        {children}
        <PremiumModal />
      </div>
    </SubscriptionLevelProvider>
  );
}
