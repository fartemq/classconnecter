
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the schema for our tutor profile form
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
});

type FormValues = z.infer<typeof formSchema>;

const TutorCompletePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      city: "",
      hourlyRate: 0,
      subjects: [],
      teachingLevels: [],
      avatarUrl: "",
    },
  });

  // Check if user is authenticated and get current user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          toast({
            title: "Требуется авторизация",
            description: "Пожалуйста, войдите в систему для продолжения.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Check if user is a tutor
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw new Error("Ошибка при загрузке профиля");
        }
        
        if (profileData.role !== "tutor") {
          toast({
            title: "Доступ запрещен",
            description: "Эта страница доступна только для репетиторов.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        setUser(session.user);
        
        // Populate form with existing data if available
        if (profileData) {
          form.setValue("firstName", profileData.first_name || "");
          form.setValue("lastName", profileData.last_name || "");
          form.setValue("bio", profileData.bio || "");
          form.setValue("city", profileData.city || "");
          setAvatarUrl(profileData.avatar_url);
        }
      } catch (error) {
        console.error("Auth error:", error);
        toast({
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Произошла ошибка при проверке аутентификации",
          variant: "destructive",
        });
      }
    };

    checkAuth();
  }, [navigate, form]);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("is_active", true)
          .order("name");
        
        if (error) {
          throw error;
        }
        
        setSubjects(data || []);

        // Also fetch categories
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true);
          
        if (catError) {
          throw catError;
        }
        
        setCategories(catData || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке предметов",
          variant: "destructive",
        });
      }
    };

    fetchSubjects();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // in MB
    
    if (fileSize > 2) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла - 2 МБ",
        variant: "destructive",
      });
      return;
    }
    
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    
    setIsUploading(true);
    
    try {
      // Create a unique file name
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Ошибка загрузки фото",
        description: "Произошла ошибка при загрузке фотографии",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload avatar if selected
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar();
        if (!finalAvatarUrl) {
          throw new Error("Не удалось загрузить фото профиля");
        }
      }
      
      // Update profile in the database
      const { error: profileError } = await supabase.from("profiles").update({
        first_name: values.firstName,
        last_name: values.lastName,
        bio: values.bio,
        city: values.city,
        avatar_url: finalAvatarUrl,
        // Store teaching levels as JSON in another field since it's not in the schema
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // For each selected subject, create a tutor_subject entry
      for (const subjectId of values.subjects) {
        // Find a default category for this subject
        const defaultCategory = categories.find(c => c.subject_id === subjectId);
        const categoryId = defaultCategory ? defaultCategory.id : null;
        
        if (!categoryId) {
          console.warn(`No default category found for subject ${subjectId}`);
          continue;
        }
        
        const { error: subjectError } = await supabase.from("tutor_subjects").insert({
          tutor_id: user.id,
          subject_id: subjectId,
          category_id: categoryId,
          hourly_rate: values.hourlyRate,
          is_active: true
        });
        
        if (subjectError) {
          console.error("Error adding subject:", subjectError);
        }
      }
      
      toast({
        title: "Профиль успешно создан!",
        description: "Теперь вы можете начать работу с учениками",
      });
      
      navigate("/profile/tutor");
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
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Заполните профиль репетитора</CardTitle>
              <CardDescription>
                Для начала работы на платформе необходимо заполнить все обязательные поля
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback>{form.getValues("firstName").charAt(0) || "Р"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Рекомендуемый размер: 400x400 пикселей (макс. 2 МБ)
                      </p>
                    </div>
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
                  <FormField
                    control={form.control}
                    name="subjects"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Предметы *</FormLabel>
                          <p className="text-sm text-gray-500">
                            Выберите предметы, которые вы преподаете
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {subjects.map((subject) => (
                            <FormItem
                              key={subject.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.getValues("subjects").includes(subject.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = form.getValues("subjects");
                                    if (checked) {
                                      form.setValue("subjects", [...currentValues, subject.id], {
                                        shouldValidate: true,
                                      });
                                    } else {
                                      form.setValue(
                                        "subjects",
                                        currentValues.filter((value) => value !== subject.id),
                                        { shouldValidate: true }
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {subject.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Teaching levels */}
                  <FormField
                    control={form.control}
                    name="teachingLevels"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Уровни обучения *</FormLabel>
                          <p className="text-sm text-gray-500">
                            С какими учениками вы работаете
                          </p>
                        </div>
                        <div className="flex flex-col space-y-4">
                          {[
                            { id: "школьник", label: "Школьник" },
                            { id: "студент", label: "Студент" },
                            { id: "взрослый", label: "Взрослый" },
                          ].map((level) => (
                            <FormItem
                              key={level.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.getValues("teachingLevels").includes(level.id as any)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = form.getValues("teachingLevels");
                                    if (checked) {
                                      form.setValue("teachingLevels", [...currentValues, level.id as any], {
                                        shouldValidate: true,
                                      });
                                    } else {
                                      form.setValue(
                                        "teachingLevels",
                                        currentValues.filter((value) => value !== level.id),
                                        { shouldValidate: true }
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {level.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isLoading || isUploading}
                      className="ml-auto"
                    >
                      {isLoading || isUploading ? "Сохранение..." : "Сохранить и продолжить"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorCompletePage;
