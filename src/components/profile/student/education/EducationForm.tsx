
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Loader } from '@/components/ui/loader';
import { StudentEducationFormValues } from '@/types/education';

// Form schema for validation
const formSchema = z.object({
  level: z.string().min(1, "Выберите уровень образования"),
  schoolName: z.string().min(1, "Введите название учебного заведения"),
  grade: z.string().min(1, "Выберите класс/курс"),
  goals: z.string().optional(),
});

export const StudentEducationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEducation, setExistingEducation] = useState<StudentEducationFormValues | null>(null);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: '',
      schoolName: '',
      grade: '',
      goals: '',
    },
  });
  
  // Load existing education data
  React.useEffect(() => {
    const fetchEducation = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('student_education')
          .select('*')
          .eq('student_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching education data:', error);
          return;
        }
        
        if (data) {
          // Map database fields to form fields
          const formValues: StudentEducationFormValues = {
            level: data.level,
            schoolName: data.school_name,
            grade: data.grade,
            goals: data.goals || '',
          };
          
          setExistingEducation(formValues);
          form.reset(formValues);
        }
      } catch (error) {
        console.error('Error in fetchEducation:', error);
      }
    };
    
    fetchEducation();
  }, [user?.id]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Вы должны быть авторизованы для выполнения этого действия",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for database
      const educationData = {
        student_id: user.id,
        level: values.level,
        school_name: values.schoolName,
        grade: values.grade,
        goals: values.goals || null,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      // Update or insert based on whether education record exists
      if (existingEducation) {
        result = await supabase
          .from('student_education')
          .update(educationData)
          .eq('student_id', user.id);
      } else {
        result = await supabase
          .from('student_education')
          .insert({
            ...educationData,
            created_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Успешно",
        description: "Данные об образовании сохранены",
      });
      
      // Update local state to reflect that we now have education data
      if (!existingEducation) {
        setExistingEducation({
          level: values.level,
          schoolName: values.schoolName,
          grade: values.grade,
          goals: values.goals || '',
        });
      }
      
    } catch (error) {
      console.error('Error saving education data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Не удалось сохранить данные",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Образование</CardTitle>
        <CardDescription>
          Укажите информацию о вашем текущем образовании
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Уровень образования</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите уровень образования" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="elementary">Начальная школа (1-4 класс)</SelectItem>
                      <SelectItem value="middle">Средняя школа (5-9 класс)</SelectItem>
                      <SelectItem value="high">Старшая школа (10-11 класс)</SelectItem>
                      <SelectItem value="university">Высшее образование</SelectItem>
                      <SelectItem value="professional">Профессиональное образование</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Учебное заведение</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название учебного заведения" {...field} />
                  </FormControl>
                  <FormDescription>
                    Укажите название школы, колледжа или университета
                  </FormDescription>
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите класс или курс" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.watch('level') === 'elementary' && (
                        <>
                          <SelectItem value="1">1 класс</SelectItem>
                          <SelectItem value="2">2 класс</SelectItem>
                          <SelectItem value="3">3 класс</SelectItem>
                          <SelectItem value="4">4 класс</SelectItem>
                        </>
                      )}
                      
                      {form.watch('level') === 'middle' && (
                        <>
                          <SelectItem value="5">5 класс</SelectItem>
                          <SelectItem value="6">6 класс</SelectItem>
                          <SelectItem value="7">7 класс</SelectItem>
                          <SelectItem value="8">8 класс</SelectItem>
                          <SelectItem value="9">9 класс</SelectItem>
                        </>
                      )}
                      
                      {form.watch('level') === 'high' && (
                        <>
                          <SelectItem value="10">10 класс</SelectItem>
                          <SelectItem value="11">11 класс</SelectItem>
                        </>
                      )}
                      
                      {form.watch('level') === 'university' && (
                        <>
                          <SelectItem value="bachelor1">1 курс бакалавриата</SelectItem>
                          <SelectItem value="bachelor2">2 курс бакалавриата</SelectItem>
                          <SelectItem value="bachelor3">3 курс бакалавриата</SelectItem>
                          <SelectItem value="bachelor4">4 курс бакалавриата</SelectItem>
                          <SelectItem value="master1">1 курс магистратуры</SelectItem>
                          <SelectItem value="master2">2 курс магистратуры</SelectItem>
                        </>
                      )}
                      
                      {form.watch('level') === 'professional' && (
                        <>
                          <SelectItem value="year1">1 курс</SelectItem>
                          <SelectItem value="year2">2 курс</SelectItem>
                          <SelectItem value="year3">3 курс</SelectItem>
                          <SelectItem value="year4">4 курс</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цели обучения</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите ваши цели обучения" 
                      {...field} 
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Укажите, чего вы хотите достичь с помощью репетитора
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
