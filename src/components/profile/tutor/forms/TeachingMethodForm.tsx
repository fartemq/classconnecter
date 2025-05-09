
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
              <Input type="number" min="0" max="50" {...field} />
            </FormControl>
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
        control={control}
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
            <FormMessage />
            <p className="text-xs text-gray-500 mt-1">
              Вы можете добавить ссылку на видео, в котором рассказываете о своей методике преподавания
            </p>
            
            {field.value && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Предпросмотр видео:</label>
                <div className="aspect-w-16 aspect-h-9 w-full">
                  <iframe
                    src={field.value.replace('youtu.be/', 'youtube.com/embed/').replace('youtube.com/watch?v=', 'youtube.com/embed/')}
                    title="Видео-презентация"
                    className="w-full h-64 rounded-md"
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
