import ResumeEditor from "@/components/ResumeEditor";
import prisma from "@/lib/prisma";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

interface EditorPageProps {
  searchParams: Promise<{ resumeId?: string }>;
}

export const metadata: Metadata = {
  title: "Design your resume",
};

const EditorPage = async ({ searchParams }: EditorPageProps) => {
  const { resumeId } = await searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resumeToEdit = resumeId
    ? await prisma.resume.findUnique({
        where: { id: resumeId, userId },
        include: resumeDataInclude,
      })
    : null;
  return <ResumeEditor resumeToEdit={resumeToEdit} />;
};

export default EditorPage;
