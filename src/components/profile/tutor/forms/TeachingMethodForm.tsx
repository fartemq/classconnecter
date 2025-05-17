
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TutorFormValues } from "@/types/tutor";

interface TeachingMethodFormProps {
  control: Control<TutorFormValues>;
}

export const TeachingMethodForm: React.FC<TeachingMethodFormProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      {/* Methodology */}
      <FormField
        control={control}
        name="methodology"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Методика преподавания</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Опишите вашу методику преподавания..."
                className="min-h-[120px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Расскажите о вашем подходе к обучению, методах и техниках, которые вы используете
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
            <FormLabel>Стаж преподавания (лет)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={50}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Укажите, сколько лет вы преподаете
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
                placeholder="Укажите ваши профессиональные достижения и сертификаты..."
                className="min-h-[100px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Перечислите ваши профессиональные награды, сертификаты и другие достижения
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
            <FormLabel>Ссылка на видеопрезентацию</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Добавьте ссылку на видео, где вы рассказываете о себе и своем подходе к преподаванию
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
