import { ResumeServerData } from "@/lib/types";
import { ResumeValues } from "@/lib/validation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fileReplacer = (key: unknown, value: unknown) => {
  return value instanceof File
    ? {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      }
    : value;
};

export const mapToResumeValues = (data: ResumeServerData): ResumeValues => {
  return {
    id: data.id,
    title: data.title || undefined,
    description: data.description || undefined,
    photo: data.photoUrl || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    jobTitle: data.jobTitle || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    workExperiences: data.WorkExperiences.map((exp) => ({
      position: exp.position || undefined,
      company: exp.company || undefined,
      startDate: exp.startDate?.toISOString().split("T")[0] || undefined,
      endDate: exp.endDate?.toISOString().split("T")[0] || undefined,
      description: exp.description || undefined,
    })),
    educations: data.Education.map((edu) => ({
      degree: edu.degree || undefined,
      school: edu.school || undefined,
      startDate: edu.startDate?.toISOString().split("T")[0] || undefined,
      endDate: edu.endDate?.toISOString().split("T")[0] || undefined,
    })),
    skills: data.skills,
    borderStyle: data.borderStyle,
    colorHex: data.colorHex,
    summary: data.summary || undefined,
  };
};
