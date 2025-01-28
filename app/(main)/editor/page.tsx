import ResumeEditor from "@/components/ResumeEditor";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Design your resume",
};

const EditorPage = () => {
  return <ResumeEditor />;
};

export default EditorPage;
