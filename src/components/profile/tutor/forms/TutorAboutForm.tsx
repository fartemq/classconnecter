
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { EducationForm } from "./EducationForm";
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

// Объединенная схема с необязательными полями
const formSchema = personalSchema.merge(educationSchema).extend({
  experience: z.coerce.number().optional(),
  achievements: z.string().optional(),
  videoUrl: z.string().url({ message: "Введите корректный URL видео" }).optional().or(z.literal('')),
});

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

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleAvatarChange = (file: File | null, url: string | null) => {
    console.log("Avatar changed:", file, url);
    setAvatarFile(file);
    setAvatarUrl(url);
  };

  const handleSubmit = async (values: TutorFormValues) => {
    try {
      setIsLoading(true);
      console.log("Submitting form with values:", values);
      console.log("Avatar file:", avatarFile);
      console.log("Avatar URL:", avatarUrl);
      
      await onSubmit(values, avatarFile, avatarUrl);
      
      // Очищаем файл аватара после успешного сохранения,
      // чтобы не загружать его повторно при следующем сохранении
      setAvatarFile(null);
      
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация и образование</CardTitle>
            <CardDescription>
              Расскажите о себе, своем опыте преподавания и образовании
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Info */}
            <PersonalInfoForm 
              control={form.control} 
              avatarUrl={avatarUrl} 
              onAvatarChange={handleAvatarChange} 
            />
            
            {/* Education */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Образование</h3>
              <EducationForm control={form.control} tutorProfile={tutorProfile} />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader size="sm" className="mr-2" /> : null}
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
