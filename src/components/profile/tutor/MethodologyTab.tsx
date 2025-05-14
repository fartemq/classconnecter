
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { TutorProfile } from "@/types/tutor";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth";

interface MethodologyTabProps {
  profile: TutorProfile;
}

export const MethodologyTab = ({ profile }: MethodologyTabProps) => {
  const { user } = useAuth();
  const [methodology, setMethodology] = useState(profile.methodology || "");
  const [experience, setExperience] = useState(profile.experience || 0);
  const [achievements, setAchievements] = useState(profile.achievements || "");
  const [videoUrl, setVideoUrl] = useState(profile.videoUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Set initial values from profile when component mounts or profile changes
  useEffect(() => {
    setMethodology(profile.methodology || "");
    setExperience(profile.experience || 0);
    setAchievements(profile.achievements || "");
    setVideoUrl(profile.videoUrl || "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    if (!user?.id) {
      setError("Необходимо авторизоваться");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Saving methodology data:", {
        methodology,
        experience,
        achievements,
        videoUrl,
      });

      // First, check if tutor_profiles exists for this user
      const { data: existingProfile, error: checkError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", user.id)
        .single();
        
      console.log("Existing profile check:", existingProfile, checkError);
      
      // Prepare data for update or insert
      const profileData = {
        methodology,
        experience,
        achievements,
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
      };

      if (!existingProfile) {
        // Insert new record with required ID
        console.log("Creating new tutor profile");
        const { error: insertError } = await supabase
          .from("tutor_profiles")
          .insert({
            ...profileData,
            id: user.id,
            is_published: false,
            education_verified: false
          });

        if (insertError) {
          console.error("Error creating tutor profile:", insertError);
          throw new Error(`Не удалось создать профиль: ${insertError.message}`);
        }
      } else {
        // Update existing record
        console.log("Updating existing tutor profile");
        const { error: updateError } = await supabase
          .from("tutor_profiles")
          .update(profileData)
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating tutor profile:", updateError);
          throw new Error(`Не удалось обновить данные: ${updateError.message}`);
        }
      }

      setIsSaved(true);
      toast({
        title: "Информация обновлена",
        description: "Ваша методология преподавания успешно сохранена",
      });
    } catch (err) {
      console.error("Error saving methodology:", err);
      const errorMessage = err instanceof Error ? err.message : "Не удалось обновить информацию";
      
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
      <h2 className="text-2xl font-semibold mb-6">Методика преподавания</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isSaved && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">Данные успешно сохранены</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="experience">Опыт преподавания (лет)</Label>
            <Input
              id="experience"
              type="number"
              value={experience === null ? "" : experience}
              onChange={(e) => setExperience(Number(e.target.value) || 0)}
              min={0}
              max={50}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              Укажите ваш стаж преподавания в годах
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="methodology">Методика преподавания</Label>
            <Textarea
              id="methodology"
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              placeholder="Опишите свою методику преподавания..."
              className="min-h-[150px]"
            />
            <p className="text-sm text-gray-500">
              Расскажите, какие методы и подходы вы используете в обучении
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Достижения и сертификаты</Label>
            <Textarea
              id="achievements"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Перечислите ваши профессиональные достижения, сертификаты и награды..."
              className="min-h-[100px]"
            />
            <p className="text-sm text-gray-500">
              Укажите ваши дипломы, награды и профессиональные успехи
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-url">Видео-презентация (URL)</Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/example"
            />
            <p className="text-sm text-gray-500">
              Ссылка на YouTube-видео, где вы рассказываете о своем опыте
            </p>
          </div>

          {videoUrl && getYoutubeEmbedUrl(videoUrl) && (
            <div className="mt-4">
              <Label className="mb-2 block">Предпросмотр видео:</Label>
              <div className="aspect-video">
                <iframe
                  src={getYoutubeEmbedUrl(videoUrl) || ""}
                  title="Видео-презентация"
                  className="w-full h-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
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
