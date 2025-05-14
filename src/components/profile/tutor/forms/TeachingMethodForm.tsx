
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { TutorFormValues } from "@/types/tutor";

interface TeachingMethodFormProps {
  control: Control<TutorFormValues>;
}

export const TeachingMethodForm: React.FC<TeachingMethodFormProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      {/* Experience */}
      <FormField
        control={control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Опыт преподавания (в годах)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                max="50" 
                className="w-full md:w-[200px]"
                {...field} 
                value={field.value || ''} 
              />
            </FormControl>
            <FormDescription>
              Укажите ваш опыт преподавания в годах
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
            <FormLabel>Методика преподавания</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Опишите свою методику преподавания..."
                className="min-h-[160px] resize-y"
                {...field}
                value={field.value || ''} 
              />
            </FormControl>
            <FormDescription className="flex justify-between">
              <span>Расскажите подробнее о вашем подходе к преподаванию</span>
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
            <FormLabel>Профессиональные достижения</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ваши достижения, награды, публикации..."
                className="min-h-[120px] resize-y"
                {...field}
                value={field.value || ''} 
              />
            </FormControl>
            <FormDescription className="flex justify-between">
              <span>Перечислите свои профессиональные достижения, сертификаты, награды</span>
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
            <FormLabel>Ссылка на видео-презентацию</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://youtube.com/watch?v=..." 
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Добавьте ссылку на видео, в котором вы рассказываете о своих методах преподавания (YouTube, Vimeo и др.)
            </FormDescription>
            <FormMessage />
            
            {field.value && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Предпросмотр видео:</h5>
                <div className="aspect-video w-full max-w-xl bg-black rounded-md overflow-hidden">
                  <iframe
                    src={field.value.replace('youtu.be/', 'youtube.com/embed/').replace('youtube.com/watch?v=', 'youtube.com/embed/')}
                    title="Видео-презентация"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};
