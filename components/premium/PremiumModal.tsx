"use client";
import { createCheckoutSession } from "@/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Check } from "lucide-react";
import { useState } from "react";

const premiumFeatures = ["AI Tools", "Up to 3 Resumes"];

const premiumPlusFeatures = ["Unlimited Resumes", "Design Customizations"];
const PremiumModal = () => {
  const { open, setOpen } = usePremiumModal();

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const handlePremiumClick = async (priceId: string) => {
    try {
      setLoading(true);
      const redirectUrl = await createCheckoutSession(priceId);

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error("Redirect URL is required");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error in creating a checkout",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">
            Resume Builder AI Premium
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p>
            Get a premium subscription to unlock all features of our AI resume
            builder.
          </p>
          <div className="flex">
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="text-center text-lg font-bold">Premium</h3>
              <ul className="space-y-2">
                {premiumFeatures.map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <Check className="size-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  handlePremiumClick(
                    env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY
                  )
                }
                disabled={loading}
                variant={"secondary"}
              >
                Get Premium
              </Button>
            </div>
            <div className="border-1 border mx-6" />
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="text-center text-lg font-bold bg-clip-text bg-gradient-to-r from-green-600 to-green-400 text-transparent">
                Premium Plus
              </h3>
              <ul className="space-y-2">
                {premiumPlusFeatures.map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <Check className="size-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  handlePremiumClick(
                    env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY
                  )
                }
                disabled={loading}
                variant={"premium"}
              >
                Get Premium Plus
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
