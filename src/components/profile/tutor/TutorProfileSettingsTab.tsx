
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TutorAboutTab } from "./TutorAboutTab";
import { SubjectsTab } from "./SubjectsTab";
import { MethodologyTab } from "./MethodologyTab";
import { Profile } from "@/hooks/profiles/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchTutorProfile } from "@/services/tutorProfileService"; 
import { TutorProfile } from "@/types/tutor";
import { Loader } from "@/components/ui/loader";
import { TutorPublishController } from "./TutorPublishController";
import { useAuth } from "@/hooks/useAuth";
import { User, BookOpen, BookText } from "lucide-react";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";

interface TutorProfileSettingsTabProps {
  profile: Profile;
}

export const TutorProfileSettingsTab = ({ profile }: TutorProfileSettingsTabProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // Load tutor profile data
  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchTutorProfile(profile.id);
        setTutorProfile(data);
        setIsPublished(data?.isPublished || false);
      } catch (err) {
        console.error("Error loading tutor profile:", err);
        setError("Не удалось загрузить профиль преподавателя");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTutorProfile();
  }, [profile?.id]);

  const handlePublishStatusChange = async (newStatus: boolean) => {
    setIsPublished(newStatus);
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки профиля</h1>
      </div>

      {/* Publication status section */}
      <TutorPublishController 
        tutorId={profile.id}
        isPublished={isPublished}
        onPublishStatusChange={handlePublishStatusChange}
      />
      
      <Card className="overflow-hidden border rounded-lg shadow-sm">
        <TooltipProvider>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex rounded-none border-b bg-card">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="about" 
                    className="flex-1 rounded-none border-r data-[state=active]:bg-muted flex items-center justify-center gap-2 py-3"
                  >
                    <User className="h-4 w-4" />
                    <span>Основная информация</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Личные данные и образование</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="subjects" 
                    className="flex-1 rounded-none border-r data-[state=active]:bg-muted flex items-center justify-center gap-2 py-3"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Предметы и цены</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Управление предметами и стоимостью занятий</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="methodology" 
                    className="flex-1 rounded-none data-[state=active]:bg-muted flex items-center justify-center gap-2 py-3"
                  >
                    <BookText className="h-4 w-4" />
                    <span>Методика преподавания</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Опишите вашу методику обучения и достижения</TooltipContent>
              </Tooltip>
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
        </TooltipProvider>
      </Card>
    </div>
  );
};
