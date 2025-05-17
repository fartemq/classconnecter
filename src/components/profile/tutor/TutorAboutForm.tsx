
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { EducationForm } from "./forms/EducationForm";
import { TeachingMethodForm } from "./forms/TeachingMethodForm";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { formSchema } from "./forms/validation/tutorFormSchema";
import { SaveButton } from "./forms/components/SaveButton";
import { SaveConfirmationDialog } from "./forms/components/SaveConfirmationDialog";

interface TutorAboutFormProps {
  initialData: TutorFormValues;
  tutorProfile: TutorProfile | null;
  onSubmit: (values: TutorFormValues, avatarFile: File | null, avatarUrl: string | null) => Promise<void>;
  defaultTab?: string;
}

export const TutorAboutForm: React.FC<TutorAboutFormProps> = ({ 
  initialData, 
  tutorProfile, 
  onSubmit, 
  defaultTab = "personal"
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl || null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formValues, setFormValues] = useState<TutorFormValues | null>(null);

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const handleAvatarChange = (file: File | null, url: string | null) => {
    setAvatarFile(file);
    setAvatarUrl(url);
  };

  const handleSubmit = async (values: TutorFormValues) => {
    try {
      // Предотвращаем стандартное поведение отправки формы
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
      
      await onSubmit(formValues, avatarFile, avatarUrl);
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

  // Обрабатываем перенаправление внутри формы, используя e.preventDefault() для всех отправлений формы
  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(handleSubmit)(e);
      }} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Основная информация</TabsTrigger>
            <TabsTrigger value="education">Образование</TabsTrigger>
            <TabsTrigger value="teaching">Преподавание</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Расскажите о себе и своем опыте преподавания
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
          </TabsContent>
          
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Образование</CardTitle>
                <CardDescription>
                  Информация о вашем образовании и квалификации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EducationForm control={form.control} tutorProfile={tutorProfile} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teaching">
            <Card>
              <CardHeader>
                <CardTitle>Методология преподавания</CardTitle>
                <CardDescription>
                  Дополнительная информация о вашей методике и достижениях
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeachingMethodForm control={form.control} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
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
