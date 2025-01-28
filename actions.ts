"use server";

import openai from "@/lib/openai";
import prisma from "@/lib/prisma";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  resumeSchema,
  ResumeValues,
  workExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
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

  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
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
