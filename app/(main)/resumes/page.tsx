import CreateResumeButton from "@/components/resumes/CreateResumeButton";
import ResumeItem from "@/components/resumes/ResumeItem";
import { canCreateResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscriptions";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Your Resumes",
};

const page = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [resumes, totalCount, subscriptionLevel] = await Promise.all([
    await prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: resumeDataInclude,
    }),
    prisma.resume.count({
      where: {
        userId,
      },
    }),

    getUserSubscriptionLevel(userId),
  ]);

  //Todo check quote for non premium users

  return (
    <main className="w-full px-3 py-6 mx-auto space-y-6 max-w-7xl">
      <CreateResumeButton
        canCreate={canCreateResume(subscriptionLevel, totalCount)}
      />
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Your Resumes</h1>
        <p>Total: {totalCount}</p>
      </div>
      <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
        {resumes.length > 0 &&
          resumes.map((resume) => (
            <ResumeItem key={resume.id} resume={resume} />
          ))}
      </div>
    </main>
  );
};

export default page;
