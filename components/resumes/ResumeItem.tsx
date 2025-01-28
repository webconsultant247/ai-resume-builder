"use client";

import ResumePreview from "@/components/ResumePreview";
import ResumeItemActions from "@/components/resumes/ResumeItemActions";
import { ResumeServerData } from "@/lib/types";
import { mapToResumeValues } from "@/lib/utils";
import { formatDate } from "date-fns";
import Link from "next/link";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
interface ResumeItemProps {
  resume: ResumeServerData;
}
const ResumeItem = ({ resume }: ResumeItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrint = useReactToPrint({
    contentRef,
    documentTitle: resume.title || "Resume",
  });
  const wasUpdated = resume.updatedAt !== resume.createdAt;
  return (
    <div className="group relative border rounded-lg border-transparent hover:border-border transition-colors bg-secondary p-3">
      <div className="space-y-3">
        <Link
          href={`/editor/?resumeId=${resume.id}`}
          className="inline-block w-full text-center"
        >
          <p className="font-semibold line-clamp-1">
            {resume.title || "No Title"}
          </p>
          {resume.description && (
            <p className="line-clamp-2 text-sm">{resume.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDate(resume.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </Link>
        <Link
          className="relative inline-block w-full"
          href={`/editor/?resumeId=${resume.id}`}
        >
          <ResumePreview
            resumeData={mapToResumeValues(resume)}
            contentRef={contentRef}
            className="overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-r from-white to-transparent" />
        </Link>
      </div>
      <ResumeItemActions resumeId={resume.id} onPrintClick={reactToPrint} />
    </div>
  );
};

export default ResumeItem;
