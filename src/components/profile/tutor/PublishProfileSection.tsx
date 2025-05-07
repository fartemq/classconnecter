
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { publishTutorProfile } from "@/services/tutorProfileService";
import { Badge } from "@/components/ui/badge";

interface PublishProfileSectionProps {
  tutorId: string;
  isPublished: boolean;
  onPublishStatusChange: (isPublished: boolean) => void;
}

export function PublishProfileSection({ tutorId, isPublished, onPublishStatusChange }: PublishProfileSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
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
