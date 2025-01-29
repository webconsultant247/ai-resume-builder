"use client";
import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Plus } from "lucide-react";
import Link from "next/link";

interface CreateResumeButtonProps {
  canCreate: boolean;
}
const CreateResumeButton = ({ canCreate }: CreateResumeButtonProps) => {
  const premiumModal = usePremiumModal();

  if (canCreate) {
    return (
      <Button className="flex gap-2 mx-auto w-fit" asChild>
        <Link href={"/editor"}>
          <Plus className="size-5" /> New Resume
        </Link>
      </Button>
    );
  }
  return (
    <Button
      onClick={() => premiumModal.setOpen(true)}
      className="flex gap-2 mx-auto w-fit"
    >
      <Plus className="size-5" /> New Resume
    </Button>
  );
};

export default CreateResumeButton;
