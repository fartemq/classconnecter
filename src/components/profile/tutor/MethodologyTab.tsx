
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { TutorProfile } from "@/types/tutor";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface MethodologyTabProps {
  profile: TutorProfile;
}

export const MethodologyTab = ({ profile }: MethodologyTabProps) => {
  const [methodology, setMethodology] = useState(profile.methodology || "");
  const [experience, setExperience] = useState(profile.experience || 0);
  const [achievements, setAchievements] = useState(profile.achievements || "");
  const [videoUrl, setVideoUrl] = useState(profile.videoUrl || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("tutor_profiles")
        .update({
          methodology,
          experience,
          achievements,
          video_url: videoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Информация обновлена",
        description: "Ваша методология преподавания успешно сохранена",
      });
    } catch (error) {
      console.error("Error updating methodology:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось обновить информацию о методологии преподавания",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Методология преподавания</h2>

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
              <label className="block text-sm font-medium mb-1">Методика преподавания</label>
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
              <label className="block text-sm font-medium mb-1">Опыт преподавания (лет)</label>
              <Input
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                min={0}
                max={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Достижения и сертификаты</label>
              <Textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Перечислите ваши профессиональные достижения, сертификаты и награды..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Видео-презентация (URL)</label>
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

            {videoUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Предпросмотр видео:</label>
                <div className="aspect-w-16 aspect-h-9 w-full">
                  <iframe
                    src={videoUrl.replace('youtu.be/', 'youtube.com/embed/').replace('youtube.com/watch?v=', 'youtube.com/embed/')}
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
