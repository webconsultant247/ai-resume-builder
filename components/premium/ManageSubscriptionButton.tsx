"use client";
import { createCustomerPortalSession } from "@/actions";
import LoadingButton from "@/components/forms/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ManageSubscriptionButton = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      // await some async function
      // toast("Subscription updated", "success");
      const redirectUrl = await createCustomerPortalSession();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton onClick={handleClick} loading={loading}>
      Manage subscription
    </LoadingButton>
  );
};

export default ManageSubscriptionButton;
