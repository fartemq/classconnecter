
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { EducationForm } from "./EducationForm";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Схема валидации для основной информации
const personalSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(20, { message: "Опишите ваш опыт преподавания (минимум 20 символов)" })
    .max(2000, { message: "Описание не должно превышать 2000 символов" }),
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
  achievements: z.string().max(1000, { message: "Текст не должен превышать 1000 символов" }).optional(),
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
        // Explicitly map education fields to the format expected by the API
        education_institution: formValues.educationInstitution,
        degree: formValues.degree,
        graduation_year: formValues.graduationYear,
        // Include other fields needed by the API
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        bio: formValues.bio,
        city: formValues.city,
        experience: formValues.experience,
        achievements: formValues.achievements,
        video_url: formValues.videoUrl
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
        
        <div className="sticky bottom-4 flex justify-end mt-6 bg-white p-4 border rounded-lg shadow-md z-10">
          <Button type="submit" disabled={isLoading} className="min-w-[150px]">
            {isLoading ? <Loader size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
      
      {/* Диалог подтверждения сохранения */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сохранить изменения?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите сохранить внесенные изменения в профиле?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSave}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isLoading}>
              {isLoading && <Loader size="sm" className="mr-2" />}
              Сохранить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};
