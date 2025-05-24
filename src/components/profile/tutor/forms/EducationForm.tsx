
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { TutorFormValues, TutorProfile } from "@/types/tutor";

interface EducationFormProps {
  control: Control<TutorFormValues>;
  tutorProfile: TutorProfile | null;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  control,
  tutorProfile
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Education Institution */}
      <FormField
        control={control}
        name="educationInstitution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Учебное заведение *</FormLabel>
            <FormControl>
              <Input 
                placeholder="МГУ им. М.В. Ломоносова" 
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Укажите название университета, института или другого учебного заведения
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Degree */}
      <FormField
        control={control}
        name="degree"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Степень/Специальность *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Бакалавр математики" 
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Укажите полученную степень и специальность
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Graduation Year */}
      <FormField
        control={control}
        name="graduationYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Год окончания</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1950" 
                max={currentYear + 10}
                placeholder={currentYear.toString()}
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : "")}
              />
            </FormControl>
            <FormDescription>
              Год окончания учебного заведения
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Experience */}
      <FormField
        control={control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Опыт преподавания (лет) *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                max="50"
                placeholder="5"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : "")}
              />
            </FormControl>
            <FormDescription>
              Количество лет опыта преподавания
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Methodology */}
      <FormField
        control={control}
        name="methodology"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Методика преподавания *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Опишите свой подход к преподаванию, используемые методы и технологии..."
                className="min-h-[120px] resize-y"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Расскажите о своих методах обучения и подходе к работе с учениками</span>
              <span className="text-xs text-gray-500">
                {(field.value?.length || 0)}/1000
              </span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Achievements */}
      <FormField
        control={control}
        name="achievements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Достижения и сертификаты</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Укажите ваши профессиональные достижения, сертификаты, награды..."
                className="min-h-[100px] resize-y"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Дополнительная информация о ваших достижениях (необязательно)</span>
              <span className="text-xs text-gray-500">
                {(field.value?.length || 0)}/1000
              </span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Video URL */}
      <FormField
        control={control}
        name="videoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Видео-презентация</FormLabel>
            <FormControl>
              <Input 
                type="url"
                placeholder="https://youtube.com/watch?v=..." 
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Ссылка на видео-презентацию (YouTube, Vimeo и т.д.)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
