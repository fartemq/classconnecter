import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Info, AlertTriangle, LightbulbIcon, ChevronDown, ChevronUp } from "lucide-react";
import { validateTutorProfile } from "@/services/tutorProfileValidation";
import { ProfileStatusBadge } from "./publish/ProfileStatusBadge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { publishTutorProfile } from "@/services/tutorProfileService";

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
        // Общая проверка профиля
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
            title: "Профиль не готов к публикации",
            description: "Пожалуйста, заполните все обязательные поля профиля",
            variant: "destructive",
          });
          setValidationResult(result);
          setIsLoading(false);
          return;
        }
      }
      
      // Вызвать сервисную функцию для изменения статуса публикации
      const success = await publishTutorProfile(tutorId, !isPublished);
      
      if (!success) {
        throw new Error("Не удалось изменить статус публикации");
      }
      
      // Уведомить родительский компонент об изменении статуса
      await onPublishStatusChange(!isPublished);
      
      toast({
        title: isPublished ? "Профиль снят с публикации" : "Профиль успешно опубликован!",
        description: isPublished 
          ? "Ваш профиль больше не виден студентам" 
          : "Теперь студенты могут находить вас в поиске",
        variant: "default",
      });
      
      // Обновить локальное состояние для немедленного отображения
      // Это не нужно благодаря пробросу через пропсы и состояние родителя
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

  // Визуализация списка недостающих полей
  const renderMissingFieldsList = () => {
    if (!validationResult.missingFields || validationResult.missingFields.length === 0) return null;
    
    return (
      <ul className="list-disc text-sm text-red-600 pl-5 space-y-1 mt-2">
        {validationResult.missingFields.map((field, index) => (
          <li key={index}>{field}</li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="shadow-sm border-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Публикация профиля</CardTitle>
            <CardDescription className="text-muted-foreground">
              Управляйте доступностью вашего профиля для учеников
            </CardDescription>
          </div>
          <ProfileStatusBadge isPublished={isPublished} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Статус публикации */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-amber-500">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-amber-800 font-medium">
                {isPublished
                  ? "Ваш профиль опубликован"
                  : "Ваш профиль не опубликован"}
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                {isPublished
                  ? "Ученики могут видеть ваш профиль и отправлять запросы на обучение."
                  : "Ученики не могут видеть ваш профиль. Опубликуйте его, чтобы начать принимать запросы."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Детали заполнения */}
        {!validationResult.isValid && (
          <Collapsible 
            open={openDetails} 
            onOpenChange={setOpenDetails}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger asChild className="w-full">
              <div className="p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h4 className="font-medium text-sm">Что нужно заполнить</h4>
                </div>
                <div className="text-muted-foreground">
                  {openDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <Separator />
            <CollapsibleContent>
              <div className="p-4 bg-white">
                <div className="mb-3">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {validationResult.missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
                <Link to="/profile/tutor?tab=about" className="text-blue-600 text-sm inline-flex items-center hover:underline">
                  Перейти к заполнению профиля
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Кнопка публикации */}
        <div className="pt-2">
          <Button 
            onClick={handleTogglePublish} 
            disabled={isLoading || (!isPublished && !validationResult.isValid)}
            variant={isPublished ? "destructive" : "default"}
            className="w-full md:w-auto"
            size="lg"
          >
            {isPublished ? (
              <>Снять с публикации</>
            ) : (
              <><Check className="h-4 w-4 mr-2" /> Опубликовать профиль</>
            )}
            {isLoading && <span className="ml-2">...</span>}
          </Button>
          
          {!validationResult.isValid && !isPublished && (
            <p className="text-xs text-muted-foreground mt-2">
              Для публикации необходимо заполнить все обязательные поля профиля
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
