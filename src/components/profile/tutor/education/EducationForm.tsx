
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { TutorEducationFormValues } from '@/types/education';

// Form schema for validation
const formSchema = z.object({
  level: z.string().min(1, "Выберите уровень образования"),
  institution: z.string().min(1, "Введите название учебного заведения"),
  specialization: z.string().min(1, "Введите вашу специализацию"),
  degree: z.string().min(1, "Выберите ученую степень"),
  yearCompleted: z.number().min(1950, "Год окончания не может быть раньше 1950").max(new Date().getFullYear(), "Год окончания не может быть в будущем"),
});

export const TutorEducationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEducation, setExistingEducation] = useState<TutorEducationFormValues | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: '',
      institution: '',
      specialization: '',
      degree: '',
      yearCompleted: currentYear,
    },
  });
  
  // Load existing education data
  useEffect(() => {
    const fetchEducation = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('tutor_education')
          .select('*')
          .eq('tutor_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching education data:', error);
          return;
        }
        
        if (data) {
          // Map database fields to form fields
          const formValues: TutorEducationFormValues = {
            level: data.level,
            institution: data.institution,
            specialization: data.specialization,
            degree: data.degree,
            yearCompleted: data.year_completed,
          };
          
          setExistingEducation(formValues);
          setIsVerified(data.is_verified);
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
        tutor_id: user.id,
        level: values.level,
        institution: values.institution,
        specialization: values.specialization,
        degree: values.degree,
        year_completed: values.yearCompleted,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      // Update or insert based on whether education record exists
      if (existingEducation) {
        // If it's already verified, we need to reset the verification status if education details change
        const shouldResetVerification = 
          existingEducation.institution !== values.institution ||
          existingEducation.degree !== values.degree ||
          existingEducation.level !== values.level;
          
        result = await supabase
          .from('tutor_education')
          .update({
            ...educationData,
            // Reset verification status if major details changed
            is_verified: shouldResetVerification ? false : isVerified
          })
          .eq('tutor_id', user.id);
          
        // Update verification state if it was reset
        if (shouldResetVerification && isVerified) {
          setIsVerified(false);
        }
      } else {
        result = await supabase
          .from('tutor_education')
          .insert({
            ...educationData,
            is_verified: false,
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
          institution: values.institution,
          specialization: values.specialization,
          degree: values.degree,
          yearCompleted: values.yearCompleted,
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
          Укажите информацию о вашем образовании и квалификации
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isVerified && (
              <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-center gap-3">
                <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-800">Образование подтверждено</h4>
                  <p className="text-xs text-green-600 mt-0.5">
                    Ваше образование было проверено и подтверждено администрацией
                  </p>
                </div>
              </div>
            )}
            
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
                      <SelectItem value="bachelor">Бакалавр</SelectItem>
                      <SelectItem value="specialist">Специалист</SelectItem>
                      <SelectItem value="master">Магистр</SelectItem>
                      <SelectItem value="phd">Кандидат наук</SelectItem>
                      <SelectItem value="doctorate">Доктор наук</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Учебное заведение</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название учебного заведения" {...field} />
                  </FormControl>
                  <FormDescription>
                    Укажите полное название учебного заведения, которое вы окончили
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Специализация</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите вашу специализацию" {...field} />
                  </FormControl>
                  <FormDescription>
                    Укажите направление подготовки, специальность или факультет
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ученая степень</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ученую степень" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bachelor_degree">Бакалавр</SelectItem>
                      <SelectItem value="specialist_degree">Дипломированный специалист</SelectItem>
                      <SelectItem value="master_degree">Магистр</SelectItem>
                      <SelectItem value="candidate">Кандидат наук</SelectItem>
                      <SelectItem value="doctor">Доктор наук</SelectItem>
                      <SelectItem value="professor">Профессор</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="yearCompleted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Год окончания</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите год окончания" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {years.map(year => (
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
            
            {existingEducation && !isVerified && (
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Статус верификации</h4>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  Ожидает верификации
                </Badge>
                <p className="text-xs text-amber-700 mt-2">
                  Для верификации образования загрузите скан диплома в разделе загрузки документов. Верифицированные репетиторы получают больше заявок от учеников.
                </p>
              </div>
            )}
            
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
