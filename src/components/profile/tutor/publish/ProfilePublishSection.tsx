
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { validateTutorProfile } from "@/services/tutorProfileValidation";
import { publishTutorProfile } from "@/services/tutorProfileService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface ProfilePublishSectionProps {
  tutorId: string;
}

export const ProfilePublishSection: React.FC<ProfilePublishSectionProps> = ({ tutorId }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [validationResult, setValidationResult] = useState<{ 
    isValid: boolean; 
    missingFields: string[]; 
    warnings: string[];
  }>({
    isValid: false,
    missingFields: [],
    warnings: []
  });
  const [dismissedAlert, setDismissedAlert] = useState(false);

  // Fetch publication status and validate profile
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!tutorId) return;
      
      try {
        setIsLoading(true);
        
        // Check if profile is published
        const { data: profileData } = await supabase
          .from("tutor_profiles")
          .select("is_published")
          .eq("id", tutorId)
          .maybeSingle();
        
        setIsPublished(!!profileData?.is_published);
        
        // Validate profile completeness
        const validation = await validateTutorProfile(tutorId);
        setValidationResult(validation);
        
      } catch (error) {
        console.error("Error checking profile status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProfileStatus();
  }, [tutorId]);

  const handleTogglePublish = async () => {
    if (!user?.id) {
      toast({
        title: "Ошибка",
        description: "Необходимо авторизоваться",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // If trying to publish, validate profile first
      if (!isPublished) {
        if (!validationResult.isValid) {
          toast({
            title: "Профиль не готов к публикации",
            description: "Заполните все необходимые поля профиля",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Update publication status
      const success = await publishTutorProfile(user.id, !isPublished);
      
      if (success) {
        setIsPublished(!isPublished);
        
        toast({
          title: isPublished ? "Профиль снят с публикации" : "Профиль опубликован",
          description: isPublished 
            ? "Ваш профиль больше не виден студентам" 
            : "Теперь студенты могут находить вас в поиске",
        });
      } else {
        throw new Error("Не удалось изменить статус публикации");
      }
      
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус публикации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center p-8">
            <Loader size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Публикация профиля</span>
          {isPublished ? (
            <span className="text-sm font-medium bg-green-100 text-green-800 py-1 px-3 rounded-full flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Опубликован
            </span>
          ) : (
            <span className="text-sm font-medium bg-gray-100 text-gray-700 py-1 px-3 rounded-full flex items-center">
              <Info className="w-4 h-4 mr-1" /> Не опубликован
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Publication Alert */}
        {!validationResult.isValid && !dismissedAlert && (
          <Alert variant="destructive" className="relative">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Профиль не готов к публикации</AlertTitle>
            <AlertDescription>
              <p>Для публикации профиля необходимо заполнить следующую информацию:</p>
              <ul className="list-disc pl-5 mt-2">
                {validationResult.missingFields.map((field, index) => (
                  <li key={index} className="mt-1">{field}</li>
                ))}
              </ul>
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setDismissedAlert(true)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Закрыть</span>
            </Button>
          </Alert>
        )}
        
        {validationResult.isValid && validationResult.warnings.length > 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Рекомендации по улучшению профиля</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p>Рекомендуем заполнить дополнительную информацию для повышения привлекательности профиля:</p>
              <ul className="list-disc pl-5 mt-2">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="mt-1">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Current status info */}
        <div className="bg-gray-50 p-4 rounded-md">
          {isPublished ? (
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Ваш профиль опубликован</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Студенты могут найти вас в поиске и отправить вам запрос на обучение.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Ваш профиль не опубликован</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Опубликуйте свой профиль, чтобы студенты могли находить вас в поиске и записываться на занятия.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Publish/Unpublish button */}
        <div className="pt-2">
          <Button 
            onClick={handleTogglePublish}
            disabled={isLoading || (!isPublished && !validationResult.isValid)}
            variant={isPublished ? "destructive" : "default"}
            className="w-full md:w-auto"
          >
            {isLoading && <Loader size="sm" className="mr-2" />}
            {isPublished ? "Снять с публикации" : "Опубликовать профиль"}
          </Button>
          
          {!validationResult.isValid && !isPublished && (
            <p className="text-sm text-gray-500 mt-2">
              Для публикации необходимо заполнить все обязательные поля профиля
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Fix: Import supabase client
import { supabase } from "@/integrations/supabase/client";
