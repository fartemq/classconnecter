import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentProfileSchema, StudentProfileFormValues } from "@/components/auth/register-form-schema";
import { Loader } from "@/components/ui/loader";
import { 
  User, 
  GraduationCap, 
  School, 
  MapPin, 
  Phone, 
  FileText,
  BookOpen,
  Target,
  Video,
  Users
} from "lucide-react";
import { StudentProfileDB, StudentProfileUpdate } from "./StudentProfileTypes";

export function ProfileTab() {
  const { profile, isLoading } = useProfile("student");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<{id: string, name: string}[]>([]);
  
  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      city: "",
      phone: "",
      educationalLevel: "school",
      school: "",
      grade: "",
      subjects: [],
      learningGoals: "",
      preferredFormat: [],
    }
  });
  
  // Загрузка списка доступных предметов
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true);
      
      if (error) {
        console.error("Error fetching subjects:", error);
        return;
      }
      
      setAvailableSubjects(data || []);
    };
    
    fetchSubjects();
  }, []);

  // Загрузка данных профиля
  useEffect(() => {
    if (profile) {
      // Получаем дополнительные данные профиля студента
      const fetchStudentProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', profile.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching student profile:", error);
            return;
          }
          
          const studentProfile = data as StudentProfileDB | null;
          
          form.reset({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            bio: profile.bio || "",
            city: profile.city || "",
            phone: profile.phone || "",
            educationalLevel: (studentProfile?.educational_level as "school" | "university" | "adult") || "school",
            school: profile.school || "",
            grade: profile.grade || "",
            subjects: studentProfile?.subjects || [],
            learningGoals: studentProfile?.learning_goals || "",
            preferredFormat: studentProfile?.preferred_format || [],
          });
        } catch (err) {
          console.error("Error in profile fetch:", err);
        }
      };
      
      fetchStudentProfile();
    }
  }, [profile, form]);
  
  // Обработчик отправки формы
  const handleSubmit = async (values: StudentProfileFormValues) => {
    if (!profile) return;
    
    setIsSubmitting(true);
    
    try {
      // Обновляем основные данные в таблице profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          bio: values.bio,
          city: values.city,
          phone: values.phone,
          school: values.school,
          grade: values.grade,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      
      if (profileError) throw profileError;
      
      // Проверяем существование записи в student_profiles
      const { data: existingProfile, error: checkError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', profile.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      // Если записи нет, создаем новую, иначе обновляем существующую
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('student_profiles')
          .insert({
            id: profile.id,  // Обязательно указываем id
            educational_level: values.educationalLevel,
            subjects: values.subjects,
            learning_goals: values.learningGoals,
            preferred_format: values.preferredFormat
          });
        
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('student_profiles')
          .update({
            educational_level: values.educationalLevel,
            subjects: values.subjects,
            learning_goals: values.learningGoals,
            preferred_format: values.preferredFormat,
          })
          .eq('id', profile.id);
        
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Профиль обновлен",
        description: "Данные вашего профиля были успешно обновлены",
      });
      
      navigate("/profile/student");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Личная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Личная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Фамилия</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                    <FormLabel>О себе</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Расскажите немного о себе"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Образование */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Образование
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="educationalLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Уровень образования</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите уровень образования" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="school">Школьник</SelectItem>
                        <SelectItem value="university">Студент</SelectItem>
                        <SelectItem value="adult">Взрослый</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Учебное заведение</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Например: Школа №123"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Класс/Курс</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Например: 10 класс"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Предпочтения в обучении */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Предпочтения в обучении
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Интересующие предметы</FormLabel>
                    <FormControl>
                      <Select
                        disabled={availableSubjects.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите предметы" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="learningGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цели обучения</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Например: подготовка к ЕГЭ, улучшение успеваемости и т.д."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Предпочтительный формат занятий</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={field.value?.includes("online") ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = field.value?.includes("online")
                            ? field.value.filter(v => v !== "online")
                            : [...(field.value || []), "online"];
                          field.onChange(newValue);
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Онлайн
                      </Button>
                      <Button
                        type="button"
                        variant={field.value?.includes("offline") ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = field.value?.includes("offline")
                            ? field.value.filter(v => v !== "offline")
                            : [...(field.value || []), "offline"];
                          field.onChange(newValue);
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Очно
                      </Button>
                      <Button
                        type="button"
                        variant={field.value?.includes("group") ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = field.value?.includes("group")
                            ? field.value.filter(v => v !== "group")
                            : [...(field.value || []), "group"];
                          field.onChange(newValue);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Групповые
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Контактная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Город</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Например: Москва"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="+7 (XXX) XXX-XX-XX"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/profile/student")}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
