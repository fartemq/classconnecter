import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import { EnhancedSubjectSelection } from "./EnhancedSubjectSelection";
import { TeachingLevels } from "./TeachingLevels";
import { TutorFormValues } from "@/types/tutor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ValidationMessage } from "./ValidationMessage";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

// Define the schema for our tutor profile form with more validation
const formSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(20, { message: "Опишите ваш опыт преподавания (минимум 20 символов)" }),
  city: z.string().min(2, { message: "Укажите город" }),
  hourlyRate: z.coerce.number().positive({ message: "Цена должна быть положительным числом" }),
  subjects: z.array(z.string()).min(1, { message: "Выберите хотя бы один предмет" }),
  teachingLevels: z.array(z.enum(["школьник", "студент", "взрослый"])).min(1, {
    message: "Выберите хотя бы один уровень обучения",
  }),
  avatarUrl: z.string().optional(),
  educationInstitution: z.string().min(2, { message: "Укажите учебное заведение" }),
  degree: z.string().min(2, { message: "Укажите специальность/степень" }),
  graduationYear: z.coerce.number()
    .min(1950, { message: "Год не может быть ранее 1950" })
    .max(new Date().getFullYear(), { message: `Год не может быть позже ${new Date().getFullYear()}` }),
  methodology: z.string().optional(),
  experience: z.coerce.number().min(0, { message: "Опыт не может быть отрицательным" }).optional(),
  achievements: z.string().optional(),
  videoUrl: z.string().url({ message: "Введите корректный URL видео" }).optional().or(z.literal('')),
});

interface ProfileCompletionFormProps {
  initialValues: Partial<TutorFormValues>;
  onSubmit: (values: TutorFormValues, avatarFile: File | null) => Promise<void>;
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
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

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

  const handleSubmit = async (values: TutorFormValues) => {
    try {
      // Validate form before submission
      if (!form.formState.isValid) {
        // Find tab with errors and navigate to it
        const errors = form.formState.errors;
        if (errors.firstName || errors.lastName || errors.city || errors.bio || errors.subjects || errors.teachingLevels) {
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
      
      await onSubmit(values, avatarFile);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Function to render video preview
  const renderVideoPreview = (url: string | undefined) => {
    if (!url) return null;
    
    // Extract video ID from YouTube URL
    const videoId = url.includes("youtube.com/watch?v=") 
      ? url.split("v=")[1]?.split("&")[0]
      : url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : null;
        
    if (!videoId) return null;
    
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-500 mb-2">Предпросмотр видео:</p>
        <div className="aspect-video">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
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
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  За��олните основную информацию о себе для улучшения вашего профиля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar upload */}
                <div className="mb-6">
                  <AvatarUpload 
                    avatarUrl={avatarUrl} 
                    firstName={form.getValues("firstName")}
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* First name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя *</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фамилия *</FormLabel>
                      <FormControl>
                        <Input placeholder="Иванов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Город *</FormLabel>
                      <FormControl>
                        <Input placeholder="Москва" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subjects */}
                <EnhancedSubjectSelection form={form} subjects={subjects} isSubmitted={false} />

                {/* Teaching levels */}
                <TeachingLevels form={form} />

                {/* Hourly rate */}
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена за час, ₽ *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio / Teaching experience */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Опыт преподавания *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Расскажите о своем опыте и методике преподавания..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Образование</CardTitle>
                <CardDescription>
                  Информация о вашем образовании повышает доверие к вашему профилю
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Education Institution */}
                <FormField
                  control={form.control}
                  name="educationInstitution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Учебное заведение *</FormLabel>
                      <FormControl>
                        <Input placeholder="МГУ им. М.В. Ломоносова" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Degree */}
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Специальность/степень *</FormLabel>
                      <FormControl>
                        <Input placeholder="Бакалавр математики" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Graduation Year */}
                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год окончания *</FormLabel>
                      <Select
                        value={field.value?.toString() || currentYear.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите год" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {yearsArray.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methodology">
            <Card>
              <CardHeader>
                <CardTitle>Методика преподавания</CardTitle>
                <CardDescription>
                  Расскажите о вашей методике преподавания и достижениях
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Experience years */}
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Опыт преподавания (лет)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Methodology */}
                <FormField
                  control={form.control}
                  name="methodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Методика преподавания</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите вашу методику преподавания..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Achievements */}
                <FormField
                  control={form.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Достижения и сертификаты</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Расскажите о ваших профессиональных достижениях и сертификатах..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video URL */}
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ссылка на видеопрезентацию</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://youtube.com/watch?v=..." 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                      {field.value && renderVideoPreview(field.value)}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading || !form.formState.isValid}
            className="ml-auto"
          >
            {isLoading && <Loader size="sm" className="mr-2" />}
            {isLoading ? "Сохранение..." : "Сохранить и продолжить"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
