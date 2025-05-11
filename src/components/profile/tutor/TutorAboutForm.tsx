
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

// Схема валидации для основной информации
const personalSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(20, { message: "Опишите ваш опыт преподавания (минимум 20 символов)" }),
  city: z.string().min(2, { message: "Укажите город" }),
});

// Схема валидации для образования
const educationSchema = z.object({
  educationInstitution: z.string().min(2, { message: "Укажите название учебного заведения" }),
  degree: z.string().min(2, { message: "Укажите специальность/степень" }),
  graduationYear: z.coerce
    .number()
    .min(1950, { message: "Год должен быть не ранее 1950" })
    .max(new Date().getFullYear(), { message: `Год не может быть позже ${new Date().getFullYear()}` }),
});

// Дополнительные поля (необязательные)
const optionalSchema = z.object({
  methodology: z.string().optional(),
  experience: z.coerce.number().optional(),
  achievements: z.string().optional(),
  videoUrl: z.string().url({ message: "Введите корректный URL видео" }).optional().or(z.literal('')),
});

// Общая схема с объединением всех полей
const formSchema = personalSchema.merge(educationSchema).merge(optionalSchema);

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
      setIsLoading(true);
      console.log("Form submitted with values:", values);
      console.log("Avatar file:", avatarFile);
      console.log("Avatar URL:", avatarUrl);
      
      await onSubmit(values, avatarFile, avatarUrl);
      
      toast({
        title: "Профиль сохранен",
        description: "Изменения успешно сохранены",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла ошибка при сохранении профиля",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
        
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading && <Loader size="sm" className="mr-2" />}
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
