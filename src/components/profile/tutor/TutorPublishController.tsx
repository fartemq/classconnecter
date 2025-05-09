
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, AlertTriangle } from "lucide-react";
import { validateTutorProfile, hasTutorAddedSubjects, hasTutorAddedSchedule } from "@/services/tutorProfileValidation";
import { ProfileStatusBadge } from "./publish/ProfileStatusBadge";
import { ValidationAlert } from "./publish/ValidationAlert";
import { RecommendationAlert } from "./publish/RecommendationAlert";
import { ProfileStatusIndicator } from "./publish/ProfileStatusIndicator";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TutorPublishControllerProps {
  tutorId: string;
  isPublished: boolean;
  onPublishStatusChange: (newStatus: boolean) => Promise<boolean>;
}

export function TutorPublishController({ 
  tutorId, 
  isPublished, 
  onPublishStatusChange 
}: TutorPublishControllerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubjects, setHasSubjects] = useState(true);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [openDetails, setOpenDetails] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  }>({ isValid: true, missingFields: [], warnings: [] });
  const { toast } = useToast();

  // Проверка полноты профиля
  useEffect(() => {
    const checkProfileCompleteness = async () => {
      try {
        const hasAddedSubjects = await hasTutorAddedSubjects(tutorId);
        setHasSubjects(hasAddedSubjects);
        
        const hasAddedSchedule = await hasTutorAddedSchedule(tutorId);
        setHasSchedule(hasAddedSchedule);
        
        const result = await validateTutorProfile(tutorId);
        setValidationResult(result);
      } catch (error) {
        console.error("Error checking profile completeness:", error);
      }
    };
    
    checkProfileCompleteness();
  }, [tutorId]);

  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
      
      // Если пытаемся опубликовать, сначала проверяем полноту профиля
      if (!isPublished) {
        const result = await validateTutorProfile(tutorId);
        
        if (!result.isValid) {
          toast({
            title: "Профиль не полностью заполнен",
            description: "Пожалуйста, заполните все обязательные поля профиля перед публикацией",
            variant: "destructive",
          });
          setValidationResult(result);
          setIsLoading(false);
          return;
        }
        
        // Показываем предупреждения, но разрешаем публикацию
        if (result.warnings.length > 0) {
          const warningText = result.warnings.join("\n");
          toast({
            title: "Предупреждение",
            description: warningText,
            variant: "default",
          });
        }
      }
      
      const success = await onPublishStatusChange(!isPublished);
      
      if (!success) {
        throw new Error("Не удалось изменить статус публикации");
      }
      
      toast({
        title: isPublished ? "Профиль снят с публикации" : "Профиль успешно опубликован!",
        description: isPublished 
          ? "Ваш профиль больше не виден студентам" 
          : "Теперь студенты могут находить вас в поиске и связываться с вами",
        variant: isPublished ? "default" : "default",
      });
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
          <ProfileStatusBadge isPublished={isPublished} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Completeness Status */}
        <ValidationAlert 
          isValid={validationResult.isValid} 
          missingFields={validationResult.missingFields} 
          warnings={validationResult.warnings} 
        />
        
        {!hasSubjects && (
          <RecommendationAlert
            title="Рекомендация по улучшению профиля"
            message="У вас не добавлено ни одного предмета. Добавьте предметы, чтобы ученики могли легче находить вас в поиске."
          />
        )}
        
        {!hasSchedule && (
          <RecommendationAlert
            title="Рекомендация по улучшению профиля"
            message="У вас не добавлено расписание. Добавьте доступные слоты времени, чтобы ученики могли записаться к вам на занятия."
          />
        )}

        <ProfileStatusIndicator isPublished={isPublished} />

        {!validationResult.isValid && (
          <Collapsible 
            open={openDetails} 
            onOpenChange={setOpenDetails}
            className="border rounded-md p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-medium">Что нужно заполнить</h4>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {openDetails ? "Скрыть детали" : "Показать детали"}
                </Button>
              </CollapsibleTrigger>
            </div>
            <Separator className="my-2" />
            <CollapsibleContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {validationResult.missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Button 
          onClick={handleTogglePublish} 
          disabled={isLoading || (!isPublished && !validationResult.isValid)}
          variant={isPublished ? "destructive" : "default"}
          className="w-full md:w-auto"
        >
          {isPublished ? (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "Обработка..." : "Снять с публикации"}
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {isLoading ? "Обработка..." : "Опубликовать профиль"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
