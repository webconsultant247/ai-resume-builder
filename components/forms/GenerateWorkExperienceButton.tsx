import { generateWorkExperience } from "@/actions";
import LoadingButton from "@/components/forms/LoadingButton";
import { useSubscriptionLevel } from "@/components/resumes/SubscriptionLevelProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import {
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  workExperience,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { WandSparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface GenerateWorkExperienceButtonProps {
  onWorkExperienceGenerated: (workExperience: workExperience) => void;
}
const GenerateWorkExperienceButton = ({
  onWorkExperienceGenerated,
}: GenerateWorkExperienceButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();

  return (
    <>
      <Button
        variant={"outline"}
        type="button"
        onClick={() => {
          if (!canUseAITools(subscriptionLevel)) {
            premiumModal.setOpen(true);
            return;
          } else {
            setShowDialog(true);
          }
        }}
        //Block for premium users
      >
        <WandSparkles className="size-4" /> Smart Fill (AI)
      </Button>
      <InputDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onWorkExperienceGenerated={(workExperience) => {
          onWorkExperienceGenerated(workExperience);
          setShowDialog(false);
        }}
      />
    </>
  );
};

export default GenerateWorkExperienceButton;

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkExperienceGenerated: (workExperience: workExperience) => void;
}

const InputDialog = ({
  open,
  onOpenChange,
  onWorkExperienceGenerated,
}: InputDialogProps) => {
  const { toast } = useToast();
  const form = useForm<GenerateWorkExperienceInput>({
    resolver: zodResolver(generateWorkExperienceSchema),
    defaultValues: {
      description: "",
    },
  });

  const onSubmit = async (input: GenerateWorkExperienceInput) => {
    try {
      const response = await generateWorkExperience(input);
      onWorkExperienceGenerated(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong, AI failed to generate summary.",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Work Experience</DialogTitle>
          <DialogDescription>
            Describe this work experience and the AI will generate an optimized
            entry for you
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            action=""
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`E.g. "From Nov 2017 to Dec 2019 I worked at Google as a Software Engineer and my tasks included building scalable web applications."`}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton type="submit" loading={form.formState.isSubmitting}>
              Generate
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
