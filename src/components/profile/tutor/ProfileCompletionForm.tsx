
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorFormValues } from "@/types/tutor";
import { useToast } from "@/hooks/use-toast";

// Import form validation schemas
import { formSchema, validateStep } from "./profile-completion/formValidation";

// Import form step components
import { PersonalInfoStep } from "./profile-completion/PersonalInfoStep";
import { EducationStep } from "./profile-completion/EducationStep";
import { MethodologyStep } from "./profile-completion/MethodologyStep";
import { FormStepFooter } from "./profile-completion/FormStepFooter";

interface ProfileCompletionFormProps {
  initialValues: Partial<TutorFormValues>;
  onSubmit: (values: TutorFormValues, avatarFile: File | null) => Promise<{
    success: boolean;
    avatarUrl: string | null;
    error?: any;
  }>;
  subjects: any[];
  isLoading: boolean;
}

export const ProfileCompletionForm = ({ 
  initialValues, 
  onSubmit, 
  subjects, 
  isLoading 
}: ProfileCompletionFormProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialValues.avatarUrl || null);
  const [activeTab, setActiveTab] = useState("personal");
  const [stepSaving, setStepSaving] = useState(false);
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialValues.firstName || "",
      lastName: initialValues.lastName || "",
      bio: initialValues.bio || "",
      city: initialValues.city || "",
      hourlyRate: initialValues.hourlyRate || 1000,
      subjects: initialValues.subjects || [],
      teachingLevels: initialValues.teachingLevels || ["школьник", "студент", "взрослый"],
      educationInstitution: initialValues.educationInstitution || "",
      degree: initialValues.degree || "",
      graduationYear: initialValues.graduationYear || currentYear,
      methodology: initialValues.methodology || "",
      experience: initialValues.experience || 0,
      achievements: initialValues.achievements || "",
      videoUrl: initialValues.videoUrl || "",
    },
    mode: "onChange",
  });

  const handleAvatarChange = (file: File | null, url: string | null) => {
    setAvatarFile(file);
    setAvatarUrl(url);
  };

  // Function to save the current step and proceed to the next
  const handleStepContinue = async () => {
    const isValid = await validateStep(activeTab, form);
    
    if (!isValid) {
      toast({
        title: "Проверьте форму",
        description: "Пожалуйста, заполните все обязательные поля этого раздела",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setStepSaving(true);
      // Interim save of current data
      const currentValues = form.getValues();
      const result = await onSubmit(currentValues, avatarFile);
      
      if (!result.success) {
        throw new Error(result.error || "Ошибка сохранения данных");
      }
      
      // Show success message and move to next tab
      toast({
        title: "Данные сохранены",
        description: "Информация успешно сохранена, переходим к следующему разделу",
      });
      
      // Navigate to the next tab
      if (activeTab === "personal") {
        setActiveTab("education");
      } else if (activeTab === "education") {
        setActiveTab("methodology");
      }
    } catch (error) {
      console.error("Error saving step:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить данные, попробуйте еще раз",
        variant: "destructive",
      });
    } finally {
      setStepSaving(false);
    }
  };

  // Handle final submission
  const handleSubmit = async (values: TutorFormValues) => {
    try {
      // Validate the entire form before final submission
      const isValid = await form.trigger();
      
      if (!isValid) {
        // Find tab with errors and navigate to it
        const errors = form.formState.errors;
        if (errors.firstName || errors.lastName || errors.city || errors.bio || errors.subjects || errors.teachingLevels || errors.hourlyRate) {
          setActiveTab("personal");
        } else if (errors.educationInstitution || errors.degree || errors.graduationYear) {
          setActiveTab("education");
        } else if (errors.methodology || errors.experience || errors.achievements || errors.videoUrl) {
          setActiveTab("methodology");
        }
        
        // Show toast with error
        toast({
          title: "Ошибка заполнения формы",
          description: "Пожалуйста, проверьте все обязательные поля",
          variant: "destructive",
        });
        return;
      }
      
      const result = await onSubmit(values, avatarFile);
      
      if (!result.success) {
        throw new Error(result.error || "Ошибка сохранения профиля");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить данные профиля",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Основная информация</TabsTrigger>
            <TabsTrigger value="education">Образование</TabsTrigger>
            <TabsTrigger value="methodology">Методика преподавания</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoStep 
              form={form} 
              subjects={subjects}
              avatarUrl={avatarUrl}
              onAvatarChange={handleAvatarChange}
            />
            <FormStepFooter 
              isLoading={stepSaving} 
              onClick={handleStepContinue} 
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationStep form={form} />
            <FormStepFooter 
              isLoading={stepSaving} 
              onClick={handleStepContinue} 
            />
          </TabsContent>

          <TabsContent value="methodology">
            <MethodologyStep form={form} />
            <FormStepFooter 
              isLoading={isLoading} 
              onClick={() => {}} 
              isSubmit={true}
            />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};
