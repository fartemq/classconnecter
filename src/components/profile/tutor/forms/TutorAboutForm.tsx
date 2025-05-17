
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { EducationForm } from "./EducationForm";
import { toast } from "@/hooks/use-toast";
import { formSchema } from "./validation/tutorFormSchema";
import { SaveButton } from "./components/SaveButton";
import { SaveConfirmationDialog } from "./components/SaveConfirmationDialog";

interface TutorAboutFormProps {
  initialData: TutorFormValues;
  tutorProfile: TutorProfile | null;
  onSubmit: (values: TutorFormValues, avatarFile: File | null, avatarUrl: string | null) => Promise<void>;
}

export const TutorAboutForm: React.FC<TutorAboutFormProps> = ({ 
  initialData, 
  tutorProfile, 
  onSubmit
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl || null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formValues, setFormValues] = useState<TutorFormValues | null>(null);

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange", // Enable real-time validation
  });

  const handleAvatarChange = (file: File | null, url: string | null) => {
    console.log("Avatar changed:", file, url);
    setAvatarFile(file);
    setAvatarUrl(url);
  };

  const handleSubmit = async (values: TutorFormValues) => {
    try {
      setFormValues(values);
      setShowSaveDialog(true);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла ошибка при сохранении профиля",
        variant: "destructive",
      });
    }
  };
  
  const confirmSave = async () => {
    if (!formValues) return;
    
    try {
      setIsLoading(true);
      
      // Map form values to API expected format
      const apiValues = {
        ...formValues,
      };
      
      console.log("Mapped form values for API:", apiValues);
      
      await onSubmit(apiValues as TutorFormValues, avatarFile, avatarUrl);
      setAvatarFile(null);
      toast({
        title: "Профиль обновлен",
        description: "Данные успешно сохранены",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла ошибка при сохранении профиля",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowSaveDialog(false);
    }
  };
  
  const cancelSave = () => {
    setShowSaveDialog(false);
    setFormValues(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Личная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Личная информация</CardTitle>
            <CardDescription>
              Заполните основные сведения о себе, которые будут видны ученикам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalInfoForm 
              control={form.control} 
              avatarUrl={avatarUrl} 
              onAvatarChange={handleAvatarChange} 
            />
          </CardContent>
        </Card>
        
        {/* Образование */}
        <Card>
          <CardHeader>
            <CardTitle>Образование</CardTitle>
            <CardDescription>
              Укажите информацию о вашем образовании
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EducationForm control={form.control} tutorProfile={tutorProfile} />
          </CardContent>
        </Card>
        
        <SaveButton isLoading={isLoading} />
      </form>
      
      <SaveConfirmationDialog 
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onConfirm={confirmSave}
        onCancel={cancelSave}
        isLoading={isLoading}
      />
    </Form>
  );
};
