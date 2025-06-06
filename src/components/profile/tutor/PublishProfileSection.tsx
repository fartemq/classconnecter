
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { 
  validateTutorProfile,
  ValidationResult 
} from "@/services/tutor/validationService";
import { ValidationAlert } from "./publish/ValidationAlert";
import { RecommendationAlert } from "./publish/RecommendationAlert";
import { ProfileStatusIndicator } from "./publish/ProfileStatusIndicator";
import { ProfileStatusBadge } from "./publish/ProfileStatusBadge";
import { supabase } from "@/integrations/supabase/client";

interface PublishProfileSectionProps {
  tutorId: string;
  isPublished: boolean;
  onPublishStatusChange: (newStatus: boolean) => Promise<boolean>;
}

export function PublishProfileSection({ tutorId, isPublished, onPublishStatusChange }: PublishProfileSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubjects, setHasSubjects] = useState(true);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [showValidation, setShowValidation] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    missingFields: [],
    warnings: [],
    errors: [],
    completionPercentage: 100
  });
  const { toast } = useToast();

  // Check profile completeness
  useEffect(() => {
    const checkProfileCompleteness = async () => {
      try {
        // Get tutor profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            *,
            tutor_profiles(*)
          `)
          .eq('id', tutorId)
          .single();

        if (error) throw error;

        // Validate the tutor profile
        const profileData = {
          ...profile,
          ...profile.tutor_profiles?.[0]
        };
        
        const result = validateTutorProfile(profileData);
        setValidationResult(result);
        
        // Check if tutor has added subjects
        const { data: subjectsData } = await supabase
          .from('tutor_subjects')
          .select('id')
          .eq('tutor_id', tutorId)
          .limit(1);
        setHasSubjects(!!subjectsData && subjectsData.length > 0);
        
        // Check if tutor has added schedule
        const { data: scheduleData } = await supabase
          .from('tutor_schedule')
          .select('id')
          .eq('tutor_id', tutorId)
          .limit(1);
        setHasSchedule(!!scheduleData && scheduleData.length > 0);
        
        // Show validation only if profile is incomplete
        setShowValidation(!result.isValid);
      } catch (error) {
        console.error("Error checking profile completeness:", error);
      }
    };
    
    checkProfileCompleteness();
  }, [tutorId]);

  const handleDismissValidation = () => {
    setShowValidation(false);
  };

  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
      
      // If trying to publish, validate profile first
      if (!isPublished) {
        if (!validationResult.isValid) {
          toast({
            title: "Профиль не заполнен",
            description: "Пожалуйста, заполните все обязательные поля профиля перед публикацией",
            variant: "destructive",
          });
          setShowValidation(true);
          setIsLoading(false);
          return;
        }
        
        // Show warnings but allow publishing
        if (validationResult.warnings.length > 0) {
          const warningText = validationResult.warnings.join("\n");
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
      
      // Log to console for debugging
      console.log(`Profile publication status changed to: ${!isPublished ? 'published' : 'unpublished'}`);
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
        {showValidation && (
          <ValidationAlert 
            isValid={validationResult.isValid} 
            missingFields={validationResult.missingFields} 
            warnings={validationResult.warnings}
            onDismiss={handleDismissValidation}
            showDismiss={true}
          />
        )}
        
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
