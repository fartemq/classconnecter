
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { TutorProfile } from "@/types/tutor";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MethodologyTabProps {
  profile: TutorProfile;
}

export const MethodologyTab = ({ profile }: MethodologyTabProps) => {
  const [methodology, setMethodology] = useState(profile.methodology || "");
  const [experience, setExperience] = useState(profile.experience || 0);
  const [achievements, setAchievements] = useState(profile.achievements || "");
  const [videoUrl, setVideoUrl] = useState(profile.videoUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Saving methodology data:", {
        methodology,
        experience,
        achievements,
        videoUrl,
      });

      // First, check if the tutor_profiles record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", profile.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Ошибка проверки профиля: ${checkError.message}`);
      }
      
      // If no record exists, create one first
      if (!existingRecord) {
        console.log("Creating new tutor_profiles record");
        const { error: createError } = await supabase
          .from("tutor_profiles")
          .insert({
            id: profile.id,
            methodology,
            experience,
            achievements,
            video_url: videoUrl,
            updated_at: new Date().toISOString(),
          });

        if (createError) {
          console.error("Error creating tutor_profiles record:", createError);
          throw new Error(`Не удалось создать запись профиля: ${createError.message}`);
        }
      } else {
        // Update existing record
        console.log("Updating existing tutor_profiles record");
        const { error: updateError } = await supabase
          .from("tutor_profiles")
          .update({
            methodology,
            experience,
            achievements,
            video_url: videoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error updating methodology:", updateError);
          throw new Error(`Не удалось обновить данные: ${updateError.message}`);
        }
      }

      toast({
        title: "Информация обновлена",
        description: "Ваша методология преподавания успешно сохранена",
      });
    } catch (error) {
      console.error("Error updating methodology:", error);
      const errorMessage = error instanceof Error ? error.message : "Не удалось обновить информацию о методологии преподавания";
      
      setError(errorMessage);
      toast({
        title: "Ошибка сохранения",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract YouTube video ID from URL
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    let videoId;
    // Handle youtube.com/watch?v= format
    if (url.includes('youtube.com/watch?v=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    } 
    // Handle youtu.be/ format
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Методология преподавания</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ваш подход к преподаванию</CardTitle>
            <CardDescription>
              Расскажите подробнее о вашей методике обучения и подходе к учебному процессу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Методика преподавания
              </label>
              <Textarea
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="Опишите свою методику преподавания..."
                className="min-h-[150px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Расскажите, какие методы и подходы вы используете в обучении
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Опыт преподавания (лет)
              </label>
              <Input
                type="number"
                value={experience === null ? "" : experience}
                onChange={(e) => setExperience(Number(e.target.value) || 0)}
                min={0}
                max={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Достижения и сертификаты
              </label>
              <Textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Перечислите ваши профессиональные достижения, сертификаты и награды..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Видео-презентация (URL)
              </label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/example"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ссылка на видео-презентацию, где вы рассказываете о своем опыте преподавания
              </p>
            </div>

            {videoUrl && getYoutubeEmbedUrl(videoUrl) && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Предпросмотр видео:
                </label>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getYoutubeEmbedUrl(videoUrl) || ""}
                    title="Видео-презентация"
                    className="w-full h-64 rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader size="sm" className="mr-2" /> : null}
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </div>
  );
};
