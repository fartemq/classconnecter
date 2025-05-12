
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

interface TutorProfileSettingsTabProps {
  profile: Profile;
}

export const TutorProfileSettingsTab = ({ profile }: TutorProfileSettingsTabProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tutor profile data
  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchTutorProfile(profile.id);
        setTutorProfile(data);
      } catch (err) {
        console.error("Error loading tutor profile:", err);
        setError("Не удалось загрузить профиль преподавателя");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTutorProfile();
  }, [profile?.id]);

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
        isPublished={tutorProfile?.isPublished || false}
        onPublishStatusChange={async (newStatus) => {
          try {
            // This will be implemented in the TutorPublishController component
            return true;
          } catch (error) {
            return false;
          }
        }}
      />
      
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
