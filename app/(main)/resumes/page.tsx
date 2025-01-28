import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Resumes",
};

const page = () => {
  return (
    <main className="w-full px-3 py-6 mx-auto space-y-6 max-w-7xl">
      <Button className="flex gap-2 mx-auto w-fit" asChild>
        <Link href={"/editor"}>
          <Plus className="size-5" /> New Resume
        </Link>
      </Button>
    </main>
  );
};

export default page;
