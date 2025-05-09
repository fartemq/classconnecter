
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "./AvatarUpload";
import { Profile } from "@/hooks/useProfile";
import { fetchTutorProfile, saveTutorProfile } from "@/services/tutorProfileService";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
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

interface TutorAboutTabProps {
  profile: Profile;
}

export const TutorAboutTab = ({ profile }: TutorAboutTabProps) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      bio: profile?.bio || "",
      city: profile?.city || "",
      educationInstitution: "",
      degree: "",
      graduationYear: new Date().getFullYear(),
      methodology: "",
      experience: 0,
      achievements: "",
      videoUrl: "",
    },
  });

  // Загрузка данных профиля репетитора
  useEffect(() => {
    const loadTutorProfile = async () => {
      try {
        setLoadingProfile(true);
        const data = await fetchTutorProfile(profile.id);
        
        if (data) {
          setTutorProfile(data);
          
          // Заполняем форму данными
          form.reset({
            firstName: data.firstName || profile.first_name || "",
            lastName: data.lastName || profile.last_name || "",
            bio: data.bio || profile.bio || "",
            city: data.city || profile.city || "",
            educationInstitution: data.educationInstitution || "",
            degree: data.degree || "",
            graduationYear: data.graduationYear || new Date().getFullYear(),
            methodology: data.methodology || "",
            experience: data.experience || 0,
            achievements: data.achievements || "",
            videoUrl: data.videoUrl || "",
          });
          
          setAvatarUrl(data.avatarUrl || profile.avatar_url || null);
        }
      } catch (error) {
        console.error("Error loading tutor profile:", error);
        toast({
          title: "Ошибка загрузки профиля",
          description: "Не удалось загрузить данные профиля репетитора",
          variant: "destructive",
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    
    if (profile) {
      loadTutorProfile();
    }
  }, [profile, form]);

  const handleAvatarChange = (file: File | null, url: string | null) => {
    setAvatarFile(file);
    setAvatarUrl(url);
  };

  const onSubmit = async (values: TutorFormValues) => {
    try {
      setIsLoading(true);
      
      const result = await saveTutorProfile(values, profile.id, avatarFile, avatarUrl);
      
      if (result.success) {
        toast({
          title: "Профиль обновлен",
          description: "Данные профиля успешно сохранены",
        });
        
        // Обновляем локальные данные
        setTutorProfile(prev => ({
          ...prev!,
          firstName: values.firstName,
          lastName: values.lastName,
          bio: values.bio,
          city: values.city,
          educationInstitution: values.educationInstitution || "",
          degree: values.degree || "",
          graduationYear: values.graduationYear || new Date().getFullYear(),
          methodology: values.methodology || "",
          experience: values.experience || 0,
          achievements: values.achievements || "",
          videoUrl: values.videoUrl || "",
          avatarUrl: result.avatarUrl || prev?.avatarUrl,
        }));
      } else {
        throw new Error("Не удалось сохранить профиль");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла ошибка при сохранении профиля",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">О себе</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <CardContent className="space-y-6">
                  {/* Avatar upload */}
                  <AvatarUpload
                    avatarUrl={avatarUrl}
                    firstName={form.getValues("firstName")}
                    onChange={handleAvatarChange}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                  
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
                  
                  {/* Bio / Teaching experience */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>О себе и опыт преподавания *</FormLabel>
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
                    Информация о вашем образовании и квалификации
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Education Institution */}
                  <FormField
                    control={form.control}
                    name="educationInstitution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Учебное заведение *</FormLabel>
                        <FormControl>
                          <Input placeholder="МГУ им. Ломоносова" {...field} />
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
                        <FormLabel>Степень/специальность *</FormLabel>
                        <FormControl>
                          <Input placeholder="Магистр физико-математических наук" {...field} />
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
                        <FormControl>
                          <Input type="number" min="1950" max={new Date().getFullYear()} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Education verification status */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Статус верификации</h4>
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${tutorProfile?.educationVerified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      <p className="text-sm text-gray-700">
                        {tutorProfile?.educationVerified 
                          ? 'Образование подтверждено' 
                          : 'Ожидает верификации'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {tutorProfile?.educationVerified 
                        ? 'Ваше образование было проверено и подтверждено администрацией.' 
                        : 'Для верификации образования может потребоваться предоставление документов.'}
                    </p>
                  </div>
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
                <CardContent className="space-y-6">
                  {/* Experience */}
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Опыт преподавания (в годах)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="50" {...field} />
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
                            placeholder="Опишите свою методику преподавания..."
                            className="min-h-[100px]"
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
                        <FormLabel>Профессиональные достижения</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ваши достижения, награды, публикации..."
                            className="min-h-[100px]"
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
                        <FormLabel>Ссылка на видео-презентацию</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://youtube.com/watch?v=..." 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Вы можете добавить ссылку на видео, в котором рассказываете о своей методике преподавания
                        </p>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
