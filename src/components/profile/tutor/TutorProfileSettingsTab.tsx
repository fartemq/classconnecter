
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TutorAboutTab } from "./TutorAboutTab";
import { SubjectsTab } from "./SubjectsTab";
import { MethodologyTab } from "./MethodologyTab";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Profile } from "@/hooks/profiles/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchTutorProfile } from "@/services/tutorProfileService"; 
import { TutorProfile } from "@/types/tutor";
import { Loader } from "@/components/ui/loader";

interface TutorProfileSettingsTabProps {
  profile: Profile;
}

export const TutorProfileSettingsTab = ({ profile }: TutorProfileSettingsTabProps) => {
  const [activeTab, setActiveTab] = useState("about");
  const { 
    isPublished, 
    togglePublishStatus, 
    isLoading: statusLoading, 
    profileStatus, 
    alertDismissed, 
    dismissAlert 
  } = useTutorPublishStatus();
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tutor profile data
  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchTutorProfile(profile.id);
        setTutorProfile(data);
      } catch (error) {
        console.error("Error loading tutor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTutorProfile();
  }, [profile?.id]);

  // Handle publish/unpublish button click
  const handlePublishClick = async () => {
    await togglePublishStatus();
  };

  // Determine button text and style
  const buttonText = isPublished ? "Снять с публикации" : "Опубликовать профиль";
  const buttonVariant = isPublished ? "destructive" : "default";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки профиля</h1>
        <Button 
          variant={buttonVariant as any}
          onClick={handlePublishClick} 
          disabled={statusLoading || !profileStatus.isValid}
        >
          {statusLoading ? <Loader size="sm" className="mr-2" /> : null}
          {buttonText}
        </Button>
      </div>

      {!alertDismissed && profileStatus.missingFields.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Профиль не готов к публикации</AlertTitle>
          <AlertDescription>
            <p>Для публикации профиля необходимо заполнить следующую информацию:</p>
            <ul className="list-disc list-inside mt-2">
              {profileStatus.missingFields.map((field, i) => (
                <li key={i}>{field}</li>
              ))}
            </ul>
          </AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2" 
            onClick={() => dismissAlert()}
          >
            Закрыть
          </Button>
        </Alert>
      )}

      {profileStatus.isValid && profileStatus.warnings.length > 0 && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Рекомендуем дополнить профиль</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p>Для лучшей привлекательности профиля рекомендуем заполнить:</p>
            <ul className="list-disc list-inside mt-2">
              {profileStatus.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isPublished && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Профиль опубликован</AlertTitle>
          <AlertDescription>
            Ваш профиль сейчас опубликован и доступен для поиска студентам
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border rounded-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex rounded-none border-b">
            <TabsTrigger 
              value="about" 
              className="flex-1 rounded-none border-r data-[state=active]:bg-muted"
            >
              Основная информация
            </TabsTrigger>
            <TabsTrigger 
              value="subjects" 
              className="flex-1 rounded-none border-r data-[state=active]:bg-muted"
            >
              Предметы и цены
            </TabsTrigger>
            <TabsTrigger 
              value="methodology" 
              className="flex-1 rounded-none data-[state=active]:bg-muted"
            >
              Методика преподавания
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <TabsContent value="about">
              <TutorAboutTab profile={profile} />
            </TabsContent>
            
            <TabsContent value="subjects">
              <SubjectsTab tutorId={profile.id} />
            </TabsContent>
            
            <TabsContent value="methodology">
              {tutorProfile && (
                <MethodologyTab profile={tutorProfile} />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
