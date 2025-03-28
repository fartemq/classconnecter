
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Define the schema for the tutor profile completion form
const formSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(50, { message: "Описание должно содержать минимум 50 символов" }),
  hourlyRate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Укажите корректную стоимость занятия",
  }),
  city: z.string().min(2, { message: "Укажите город" }),
  subjects: z.array(z.string()).nonempty({ message: "Выберите хотя бы один предмет" }),
  levels: z.array(z.enum(["schoolboy", "student", "adult"])).nonempty({
    message: "Выберите хотя бы один уровень обучения",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const TutorCompletePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [user, setUser] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      hourlyRate: "",
      city: "",
      subjects: [],
      levels: [],
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast({
          title: "Необходима авторизация",
          description: "Пожалуйста, войдите в систему для заполнения профиля",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Load user profile data if it exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
      } else if (profileData) {
        form.setValue("firstName", profileData.first_name);
        form.setValue("lastName", profileData.last_name || "");
        form.setValue("bio", profileData.bio || "");
        form.setValue("city", profileData.city || "");
      }

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (subjectsError) {
        console.error("Error loading subjects:", subjectsError);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список предметов",
          variant: "destructive",
        });
      } else {
        setSubjects(subjectsData || []);
      }
    };

    checkAuth();
  }, [navigate, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error("Пользователь не авторизован");
      }

      // Update profile information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          bio: values.bio,
          city: values.city,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error("Ошибка при обновлении профиля");
      }

      // Add subject entries for each selected subject
      const tutorSubjectsPromises = values.subjects.map(async (subjectId) => {
        const { error } = await supabase
          .from("tutor_subjects")
          .insert({
            tutor_id: user.id,
            subject_id: subjectId,
            category_id: subjectId, // using subject_id as category_id for simplicity
            hourly_rate: Number(values.hourlyRate),
            is_active: true,
          });

        if (error) {
          console.error("Error adding subject:", error);
        }
      });

      await Promise.all(tutorSubjectsPromises);

      toast({
        title: "Профиль успешно создан!",
        description: "Вы заполнили все необходимые данные и теперь можете использовать все возможности платформы.",
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Заполните профиль репетитора
              </CardTitle>
              <CardDescription className="text-center">
                Заполните информацию о себе и своих услугах, чтобы привлечь больше студентов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя*</FormLabel>
                          <FormControl>
                            <Input placeholder="Иван" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Фамилия*</FormLabel>
                          <FormControl>
                            <Input placeholder="Иванов" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание опыта преподавания*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Расскажите о своем опыте, образовании, методике преподавания..."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Стоимость занятия (₽/час)*</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город*</FormLabel>
                        <FormControl>
                          <Input placeholder="Москва" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjects"
                    render={() => (
                      <FormItem>
                        <FormLabel>Предметы, которые вы преподаете*</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                          {subjects.map((subject) => (
                            <div key={subject.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subject-${subject.id}`}
                                checked={form.watch("subjects").includes(subject.id)}
                                onCheckedChange={(checked) => {
                                  const currentSubjects = form.getValues("subjects");
                                  if (checked) {
                                    form.setValue("subjects", [...currentSubjects, subject.id]);
                                  } else {
                                    form.setValue(
                                      "subjects",
                                      currentSubjects.filter((id) => id !== subject.id)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`subject-${subject.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {subject.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="levels"
                    render={() => (
                      <FormItem>
                        <FormLabel>С кем вы работаете*</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                          {[
                            { id: "schoolboy", label: "Школьники" },
                            { id: "student", label: "Студенты" },
                            { id: "adult", label: "Взрослые" },
                          ].map((level) => (
                            <div key={level.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`level-${level.id}`}
                                checked={form.watch("levels").includes(level.id as any)}
                                onCheckedChange={(checked) => {
                                  const currentLevels = form.getValues("levels");
                                  if (checked) {
                                    form.setValue("levels", [...currentLevels, level.id as any]);
                                  } else {
                                    form.setValue(
                                      "levels",
                                      currentLevels.filter((id) => id !== level.id)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`level-${level.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {level.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-center">
                    <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                      {isLoading ? "Сохранение..." : "Сохранить и продолжить"}
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
