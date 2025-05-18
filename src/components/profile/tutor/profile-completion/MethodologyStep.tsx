
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TutorFormValues } from "@/types/tutor";

interface MethodologyStepProps {
  form: UseFormReturn<TutorFormValues>;
}

export const MethodologyStep = ({ form }: MethodologyStepProps) => {
  // Function to render video preview
  const renderVideoPreview = (url: string | undefined) => {
    if (!url) return null;
    
    // Extract video ID from YouTube URL
    const videoId = url.includes("youtube.com/watch?v=") 
      ? url.split("v=")[1]?.split("&")[0]
      : url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : null;
        
    if (!videoId) return null;
    
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-500 mb-2">Предпросмотр видео:</p>
        <div className="aspect-video">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Методика преподавания</CardTitle>
        <CardDescription>
          Расскажите о вашей методике преподавания и достижениях
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Experience years */}
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Опыт преподавания (лет)</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Methodology */}
        <FormField
          control={form.control}
          name="methodology"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Методика преподавания</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опишите вашу методику преподавания..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Achievements */}
        <FormField
          control={form.control}
          name="achievements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Достижения и сертификаты</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Расскажите о ваших профессиональных достижениях и сертификатах..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video URL */}
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка на видеопрезентацию</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://youtube.com/watch?v=..." 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
              {field.value && renderVideoPreview(field.value)}
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
