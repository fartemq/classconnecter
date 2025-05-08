
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Upload, Info } from "lucide-react";
import { publishTutorProfile } from "@/services/tutorProfileService";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PublishProfileSectionProps {
  tutorId: string;
  isPublished: boolean;
  onPublishStatusChange: (isPublished: boolean) => void;
}

export function PublishProfileSection({ tutorId, isPublished, onPublishStatusChange }: PublishProfileSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubjects, setHasSubjects] = useState(true);  // Default to true to avoid showing warning immediately

  // Check if tutor has added subjects
  useEffect(() => {
    const checkSubjects = async () => {
      try {
        const { data, error, count } = await supabase
          .from("tutor_subjects")
          .select("id", { count: 'exact' })
          .eq("tutor_id", tutorId);
          
        if (error) {
          console.error("Error checking tutor subjects:", error);
          return;
        }
        
        setHasSubjects(count !== null && count > 0);
      } catch (error) {
        console.error("Error in checkSubjects:", error);
      }
    };
    
    checkSubjects();
  }, [tutorId]);

  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
      
      // If trying to publish but has no subjects, warn first
      if (!isPublished && !hasSubjects) {
        toast({
          title: "Предупреждение",
          description: "У вас не добавлено ни одного предмета. Студенты могут не найти вас в поиске. Рекомендуется сначала добавить предметы.",
          variant: "warning",
        });
        
        // We'll let them publish anyway, but with the warning
      }
      
      const newStatus = !isPublished;
      const success = await publishTutorProfile(tutorId, newStatus);
      
      if (success) {
        toast({
          title: newStatus ? "Профиль опубликован" : "Профиль снят с публикации",
          description: newStatus
            ? "Теперь ваш профиль доступен для студентов"
            : "Ваш профиль больше не виден студентам",
          variant: newStatus ? "default" : "destructive",
        });
        
        onPublishStatusChange(newStatus);
        
        // Log to console for debugging
        console.log(`Profile publication status changed to: ${newStatus ? 'published' : 'unpublished'}`);
      } else {
        throw new Error("Не удалось изменить статус публикации");
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус публикации профиля",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Публикация профиля</CardTitle>
            <CardDescription>
              Управляйте доступностью вашего профиля для учеников
            </CardDescription>
          </div>
          {isPublished ? (
            <Badge className="bg-green-500">Опубликован</Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">Не опубликован</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasSubjects && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Рекомендация по улучшению профиля</h4>
                <p className="text-sm text-gray-600">
                  У вас не добавлено ни одного предмета. Добавьте предметы, чтобы ученики могли легче находить вас в поиске.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-md">
          {isPublished ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Ваш профиль опубликован</h4>
                <p className="text-sm text-gray-600">
                  Студенты могут найти вас в поиске, просматривать ваш профиль,
                  отправлять сообщения и бронировать занятия согласно вашему расписанию.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Ваш профиль не опубликован</h4>
                <p className="text-sm text-gray-600">
                  Студенты не могут видеть ваш профиль. Опубликуйте его, чтобы начать
                  принимать запросы от студентов и бронирования занятий.
                </p>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleTogglePublish} 
          disabled={isLoading} 
          variant={isPublished ? "destructive" : "default"}
          className="w-full md:w-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isLoading
            ? "Обработка..."
            : isPublished
              ? "Снять с публикации"
              : "Опубликовать профиль"}
        </Button>
      </CardContent>
    </Card>
  );
}
