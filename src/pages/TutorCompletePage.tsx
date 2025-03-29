
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

// Define schema for form validation
const formSchema = z.object({
  first_name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  last_name: z.string().min(2, "Фамилия должна содержать не менее 2 символов"),
  bio: z.string().min(20, "Описание должно содержать не менее 20 символов"),
  hourly_rate: z.coerce.number().min(1, "Укажите стоимость занятия"),
  city: z.string().min(2, "Укажите город"),
  // These will be handled separately
  subjects: z.array(z.string()).nonempty("Выберите хотя бы один предмет"),
  levels: z.array(z.enum(["schoolboy", "student", "adult"])).nonempty("Выберите хотя бы один уровень"),
});

type FormValues = z.infer<typeof formSchema>;

interface Subject {
  id: string;
  name: string;
}

const TutorCompletePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<("schoolboy" | "student" | "adult")[]>([]);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
      hourly_rate: 0,
      city: "",
      subjects: [],
      levels: [],
    },
  });

  // Check authentication and load subjects on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          toast({
            title: "Требуется авторизация",
            description: "Пожалуйста, войдите в систему для продолжения.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        setUser(session.user);
        
        // Check if user is a tutor
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
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
        
        // Pre-fill form if user already has data
        if (profileData.first_name) form.setValue("first_name", profileData.first_name);
        if (profileData.last_name) form.setValue("last_name", profileData.last_name);
        if (profileData.bio) form.setValue("bio", profileData.bio);
        if (profileData.city) form.setValue("city", profileData.city);
        
        // Load subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("*")
          .eq("is_active", true)
          .order("name");
        
        if (subjectsError) {
          throw subjectsError;
        }
        
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, form]);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleLevelToggle = (level: "schoolboy" | "student" | "adult") => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        return prev.filter((l) => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const onSubmit = async (values: FormValues) => {
    // First, validate that subjects and levels are selected
    if (selectedSubjects.length === 0) {
      toast({
        title: "Выберите предметы",
        description: "Пожалуйста, выберите хотя бы один предмет, который вы преподаете",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedLevels.length === 0) {
      toast({
        title: "Выберите уровни",
        description: "Пожалуйста, выберите хотя бы один уровень, с которым вы работаете",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("Пользователь не авторизован");
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          bio: values.bio,
          city: values.city,
        })
        .eq("id", user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // For each selected subject, create a record in tutor_subjects table
      // First, remove existing subjects
      const { error: deleteError } = await supabase
        .from("tutor_subjects")
        .delete()
        .eq("tutor_id", user.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Then insert new ones
      const tutor_subjects = selectedSubjects.map(subjectId => ({
        tutor_id: user.id,
        subject_id: subjectId,
        hourly_rate: values.hourly_rate,
      }));
      
      const { error: insertError } = await supabase
        .from("tutor_subjects")
        .insert(tutor_subjects);
      
      if (insertError) {
        throw insertError;
      }
      
      // Update tutor levels
      const { error: levelsError } = await supabase
        .from("profiles")
        .update({
          teaching_levels: selectedLevels
        })
        .eq("id", user.id);
      
      if (levelsError) {
        throw levelsError;
      }
      
      toast({
        title: "Профиль сохранен!",
        description: "Ваш профиль успешно обновлен",
      });
      
      navigate("/profile/tutor");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении профиля",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

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
                Заполните необходимую информацию, чтобы ученики могли найти вас
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Личная информация</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
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
                      
                      <FormField
                        control={form.control}
                        name="last_name"
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
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>О себе и опыте преподавания *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Расскажите о своем опыте, образовании и методиках преподавания..." 
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Subjects */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Предметы *</h3>
                    <p className="text-sm text-gray-500">
                      Выберите предметы, которые вы преподаете
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={() => handleSubjectToggle(subject.id)}
                          />
                          <Label
                            htmlFor={`subject-${subject.id}`}
                            className="cursor-pointer flex-grow"
                          >
                            {subject.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedSubjects.length === 0 && (
                      <p className="text-sm text-red-500">
                        Выберите хотя бы один предмет
                      </p>
                    )}
                  </div>
                  
                  {/* Levels */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Уровни *</h3>
                    <p className="text-sm text-gray-500">
                      Выберите уровни, с которыми вы работаете
                    </p>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="level-schoolboy"
                          checked={selectedLevels.includes("schoolboy")}
                          onCheckedChange={() => handleLevelToggle("schoolboy")}
                        />
                        <Label
                          htmlFor="level-schoolboy"
                          className="cursor-pointer"
                        >
                          Школьники
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="level-student"
                          checked={selectedLevels.includes("student")}
                          onCheckedChange={() => handleLevelToggle("student")}
                        />
                        <Label
                          htmlFor="level-student"
                          className="cursor-pointer"
                        >
                          Студенты
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="level-adult"
                          checked={selectedLevels.includes("adult")}
                          onCheckedChange={() => handleLevelToggle("adult")}
                        />
                        <Label
                          htmlFor="level-adult"
                          className="cursor-pointer"
                        >
                          Взрослые
                        </Label>
                      </div>
                    </div>
                    {selectedLevels.length === 0 && (
                      <p className="text-sm text-red-500">
                        Выберите хотя бы один уровень
                      </p>
                    )}
                  </div>
                  
                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Стоимость занятия *</h3>
                    
                    <FormField
                      control={form.control}
                      name="hourly_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Стоимость за час (₽) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="50"
                              placeholder="1000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-center pt-4">
                    <Button type="submit" size="lg" disabled={isSaving}>
                      {isSaving ? "Сохранение..." : "Сохранить и продолжить"}
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
