
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { ValidationAlert } from "./publish/ValidationAlert";
import { ProfileStatusIndicator } from "./publish/ProfileStatusIndicator";
import { useTutorSubjectsCheck } from "@/hooks/useTutorSubjectsCheck";
import { Eye } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { RecommendationAlert } from "./publish/RecommendationAlert";

interface TutorPublishControllerProps {
  tutorId: string;
  isPublished: boolean;
  onPublishStatusChange: (newStatus: boolean) => Promise<boolean>;
}

export const TutorPublishController: React.FC<TutorPublishControllerProps> = ({
  tutorId,
  isPublished: initialPublishStatus,
  onPublishStatusChange,
}) => {
  const [isPublished, setIsPublished] = useState(initialPublishStatus);
  const { 
    profileStatus, 
    isLoading, 
    togglePublishStatus, 
    alertDismissed, 
    dismissAlert 
  } = useTutorPublishStatus();
  
  // Check if tutor has added any subjects
  const { hasSubjects, isLoading: isCheckingSubjects } = useTutorSubjectsCheck(tutorId);
  
  const handleTogglePublish = async () => {
    if (isLoading) return;
    
    // If trying to publish and no subjects added yet
    if (!isPublished && hasSubjects === false) {
      const missingFields = [...profileStatus.missingFields];
      if (!missingFields.includes("Предметы обучения (минимум один)")) {
        missingFields.push("Предметы обучения (минимум один)");
      }
      return;
    }
    
    const success = await togglePublishStatus();
    
    if (success) {
      setIsPublished(!isPublished);
      // Notify parent component about the change
      onPublishStatusChange(!isPublished);
    }
  };
  
  const showRecommendation = !isPublished && profileStatus.missingFields.length < 3 && profileStatus.missingFields.length > 0;
  
  return (
    <div className="space-y-4 mb-6 bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-bold mb-4">Статус публикации профиля</h2>
      
      {/* Profile status indicator */}
      <ProfileStatusIndicator isPublished={isPublished} />
      
      {/* Validation warnings & errors */}
      {!alertDismissed && (
        <ValidationAlert
          isValid={profileStatus.isValid && hasSubjects !== false}
          missingFields={
            hasSubjects === false
              ? [...profileStatus.missingFields, "Предметы обучения (минимум один)"]
              : profileStatus.missingFields
          }
          warnings={profileStatus.warnings}
          onDismiss={dismissAlert}
          showDismiss={true}
        />
      )}
      
      {/* Recommendation for profile improvement */}
      {showRecommendation && (
        <RecommendationAlert
          title="Рекомендации по улучшению профиля"
          message="Заполните все обязательные поля, добавьте фото профиля и как минимум один предмет для преподавания, чтобы увеличить шансы привлечения учеников."
        />
      )}
      
      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={handleTogglePublish}
          disabled={
            isLoading || 
            isCheckingSubjects || 
            (!isPublished && (!profileStatus.isValid || hasSubjects === false))
          }
          variant={isPublished ? "destructive" : "default"}
          className="flex-grow sm:flex-grow-0"
        >
          {isLoading && <Loader size="sm" className="mr-2" />}
          {isPublished ? "Сделать профиль невидимым" : "Опубликовать профиль"}
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="flex-grow sm:flex-grow-0">
                <Eye className="h-4 w-4 mr-2" />
                Предварительный просмотр
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Посмотрите, как ваш профиль будет выглядеть для учеников
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {!isPublished && (!profileStatus.isValid || hasSubjects === false) && (
          <p className="text-sm text-gray-500 mt-2 w-full">
            Для публикации профиля необходимо заполнить все обязательные поля
          </p>
        )}
      </div>
    </div>
  );
};
