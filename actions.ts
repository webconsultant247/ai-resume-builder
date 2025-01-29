"use server";

import { env } from "@/env";
import openai from "@/lib/openai";
import {
  canCreateResume,
  canUseAITools,
  canUseCustomization,
} from "@/lib/permissions";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { getUserSubscriptionLevel } from "@/lib/subscriptions";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  resumeSchema,
  ResumeValues,
  workExperience,
} from "@/lib/validation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import path from "path";

export const saveResume = async (values: ResumeValues) => {
  const { id } = values;
  console.log("Received values", values);

  const { photo, workExperiences, educations, ...resumeValues } =
    resumeSchema.parse(values);

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  //TODO: check Resume count for non-premium users

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!id) {
    const resumeCount = await prisma.resume.count({
      where: { userId },
    });

    if (!canCreateResume(subscriptionLevel, resumeCount)) {
      throw new Error(
        "You have reached the maximum number of resumes allowed for your subscription level."
      );
    }
  }

  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  const hasCustomizations =
    (resumeValues.borderStyle &&
      resumeValues.borderStyle !== existingResume?.borderStyle) ||
    (resumeValues.colorHex &&
      resumeValues.colorHex !== existingResume?.colorHex);

  if (hasCustomizations && canUseCustomization(subscriptionLevel)) {
    throw new Error(
      "You can't use customizations with your current subscription level."
    );
  }

  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl);
    }

    const blob = await put(`resume_photos/${path.extname(photo.name)}`, photo, {
      access: "public",
    });

    newPhotoUrl = blob.url;
  } else if (photo === null) {
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl);
    }
    newPhotoUrl = null;
  }

  if (id) {
    return prisma.resume.update({
      where: {
        id,
      },
      data: {
        ...resumeValues,
        photoUrl: newPhotoUrl,
        WorkExperiences: {
          deleteMany: {},
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        Education: {
          deleteMany: {},
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.resume.create({
      data: {
        ...resumeValues,
        userId,
        photoUrl: newPhotoUrl,
        WorkExperiences: {
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        Education: {
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
      },
    });
  }
};

export const deleteResume = async (id: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  console.log(id);

  const resume = await prisma.resume.findUnique({
    where: { id, userId },
  });

  if (!resume) {
    throw new Error("Resume not found.");
  }

  if (resume?.photoUrl) {
    await del(resume.photoUrl);
  }

  await prisma.resume.delete({ where: { id } });

  revalidatePath("/resumes");
};

export const generateSummary = async (input: GenerateSummaryInput) => {
  // TODO: check if user is premium
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error(
      "You need to upgrade your subscription to use this feature."
    );
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const systemMessage = `
      YOu are a job resume generator AI. Your task is to write a professional summary for a resume based on the job title, work experiences, educations, and skills provided. The summary should be concise and informative, highlighting the candidate's qualifications and experience. The summary should be tailored to the job title and should be free of errors and typos. The summary should be written in a professional tone and should be engaging to the reader. Only return the summary and do not include any other information in the response. 
    `;

  const userMessage = `
    Please generate a professional resume summary from this data: 
    Job Title: ${jobTitle || "N/A"}
    Work Experiences: ${
      workExperiences?.length
        ? workExperiences
            ?.map(
              (exp) => `
      Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}
      Description: ${exp.description || "N/A"}
      `
            )
            .join("\n\n")
        : "N/A"
    } 
    Education: ${
      educations?.length
        ? educations
            ?.map(
              (edu) => `
      Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
      `
            )
            .join("\n\n")
        : "N/A"
    } 
    Skills: ${skills}
    `;

  console.log("AI instructions", systemMessage, userMessage);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;
  console.log("AI response", aiResponse);
  if (!aiResponse) {
    throw new Error("AI response is empty or error happened?");
  }
  return aiResponse;
};

export const generateWorkExperience = async (
  input: GenerateWorkExperienceInput
) => {
  // TODO: check if user is premium
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error(
      "You need to upgrade your subscription to use this feature."
    );
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
    You are a job resume generator AI. Your task is to generate a single work experience based on user's input. Your response must adhere to the following format. You can omit fields if they can't be inferred form the provided data but you don't add any new one. 
    
    Job Title: <job title>
    Company: <company name>
    Start Date: <format YYYY-MM-DD> (only if provided)
    End Date: <format YYYY-MM-DD> (only if provided)
    Description: <an optimized description in bullet format, might be inferred from the job title and company name>
    `;
  const userMessage = `
  please provide a work experience description based on this description ${description}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;
  console.log("AI response", aiResponse);

  if (!aiResponse) {
    throw new Error("AI response is empty or an error happened.");
  }

  const aiWeObject = {
    position: aiResponse.match(/Job Title: (.*)/)?.[1]?.trim() || "",
    company: aiResponse.match(/Company: (.*)/)?.[1]?.trim() || "",
    startDate: aiResponse.match(/Start Date: (\d{4}-\d{2}-\d{2})/)?.[1] || "",
    endDate: aiResponse.match(/End Date: (\d{4}-\d{2}-\d{2})/)?.[1] || "",
    description:
      aiResponse
        .split("Description:")[1]
        ?.trim()
        .split("\n")
        .map((line) => line.trim())
        .join("\n") || "",
  };

  console.log("AI work experience", aiWeObject);

  return {
    ...aiWeObject,
  } satisfies workExperience;
};

export const createCheckoutSession = async (priceId: string) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as
    | string
    | undefined;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${env.NEXT_PUBLIC_BASE_URL}/billing/success`,
    cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
    customer: stripeCustomerId,
    customer_email: stripeCustomerId
      ? undefined
      : user.emailAddresses[0].emailAddress,
    metadata: {
      userId: user.id,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: `I have read AI Resume Builder's [terms of service](${env.NEXT_PUBLIC_BASE_URL}/terms) and agree to them.`,
      },
    },
    consent_collection: {
      terms_of_service: "required",
    },
  });

  if (!session) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
};

export const createCustomerPortalSession = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as
    | string
    | undefined;

  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  });

  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  return session.url;
};
