
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Upload, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { validateTutorProfile, hasTutorAddedSubjects, hasTutorAddedSchedule } from "@/services/tutorProfileValidation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PublishProfileSectionProps {
  tutorId: string;
  isPublished: boolean;
  onPublishStatusChange: (isPublished: boolean) => void;
}

export function PublishProfileSection({ tutorId, isPublished, onPublishStatusChange }: PublishProfileSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubjects, setHasSubjects] = useState(true);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  }>({ isValid: true, missingFields: [], warnings: [] });
  const { toast } = useToast();

  // Check profile completeness
  useEffect(() => {
    const checkProfileCompleteness = async () => {
      const hasAddedSubjects = await hasTutorAddedSubjects(tutorId);
      setHasSubjects(hasAddedSubjects);
      
      const hasAddedSchedule = await hasTutorAddedSchedule(tutorId);
      setHasSchedule(hasAddedSchedule);
      
      const result = await validateTutorProfile(tutorId);
      setValidationResult(result);
    };
    
    checkProfileCompleteness();
  }, [tutorId]);

  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
      
      // If trying to publish, validate profile first
      if (!isPublished) {
        const result = await validateTutorProfile(tutorId);
        
        if (!result.isValid) {
          toast({
            title: "Профиль не заполнен",
            description: "Пожалуйста, заполните все обязательные поля профиля перед публикацией",
            variant: "destructive",
          });
          setValidationResult(result);
          return;
        }
        
        // Show warnings but allow publishing
        if (result.warnings.length > 0) {
          const warningText = result.warnings.join("\n");
          toast({
            title: "Предупреждение",
            description: warningText,
            variant: "default",
          });
        }
      }
      
      const newStatus = !isPublished;
      
      // Update tutor_profiles table
      const { error } = await supabase
        .from("tutor_profiles")
        .update({ 
          is_published: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", tutorId);
      
      if (error) {
        throw error;
      }
      
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
        {/* Profile Completeness Status */}
        {!validationResult.isValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Профиль не полностью заполнен</AlertTitle>
            <AlertDescription>
              <p>Следующие поля требуют заполнения:</p>
              <ul className="list-disc pl-5 mt-2">
                {validationResult.missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validationResult.isValid && validationResult.warnings.length > 0 && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Рекомендации по улучшению профиля</AlertTitle>
            <AlertDescription className="text-amber-700">
              <ul className="list-disc pl-5 mt-2">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {!hasSubjects && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
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
        
        {!hasSchedule && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Рекомендация по улучшению профиля</h4>
                <p className="text-sm text-gray-600">
                  У вас не добавлено расписание. Добавьте доступные слоты времени, чтобы ученики могли записаться к вам на занятия.
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
                  Ученики могут найти вас в поиске, просматривать ваш профиль,
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
                  Ученики не могут видеть ваш профиль. Опубликуйте его, чтобы начать
                  принимать запросы от учеников и бронирования занятий.
                </p>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleTogglePublish} 
          disabled={isLoading || (!isPublished && !validationResult.isValid)}
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
