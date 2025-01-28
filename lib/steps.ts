import EducationForm from "@/components/forms/editor/EducationForm";
import GeneralInfoForm from "@/components/forms/editor/GeneralInfoForm";
import PersonalInfoForm from "@/components/forms/editor/PersonalInfoForm";
import SkillsForm from "@/components/forms/editor/SkillsForm";
import SummaryForm from "@/components/forms/editor/SummaryForm";
import WorkExperienceForm from "@/components/forms/editor/WorkExperienceForm";
import { EditorFormProps } from "@/lib/types";

export const steps: {
  title: string;
  component: React.ComponentType<EditorFormProps>;
  key: string;
}[] = [
  {
    title: "General Info",
    component: GeneralInfoForm,
    key: "general-info",
  },
  {
    title: "Personal Info",
    component: PersonalInfoForm,
    key: "personal-info",
  },
  {
    title: "Work Experience",
    component: WorkExperienceForm,
    key: "work-experience",
  },
  {
    title: "Education",
    component: EducationForm,
    key: "education",
  },
  {
    title: "Skills",
    component: SkillsForm,
    key: "skills",
  },
  {
    title: "Summary",
    component: SummaryForm,
    key: "summary",
  },
];

export default steps;
