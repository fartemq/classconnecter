
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TutorAboutTab } from "./TutorAboutTab";
import { MethodologyTab } from "./MethodologyTab";
import { MaterialsTab } from "./MaterialsTab";
import { Profile } from "@/hooks/profiles/types";
import { fetchTutorProfile } from "@/services/tutorProfileService";
import { TutorProfile } from "@/types/tutor";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/auth";

interface TeachingInfoTabProps {
  profile: Profile;
}

export const TeachingInfoTab = ({ profile }: TeachingInfoTabProps) => {
  const [activeTab, setActiveTab] = useState("about");
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!user) return;
      
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
  }, [profile.id, user]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reload tutor profile data when switching to methodology tab
    if (value === "methodology" && user) {
      fetchTutorProfile(profile.id).then(data => {
        if (data) setTutorProfile(data);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Информация о преподавании</h2>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="about">О себе</TabsTrigger>
          <TabsTrigger value="methodology">Методология</TabsTrigger>
          <TabsTrigger value="materials">Материалы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about">
          <Card className="border-none shadow-none">
            <TutorAboutTab profile={profile} />
          </Card>
        </TabsContent>
        
        <TabsContent value="methodology">
          <Card className="border-none shadow-none">
            {tutorProfile && <MethodologyTab profile={tutorProfile} />}
          </Card>
        </TabsContent>
        
        <TabsContent value="materials">
          <Card className="border-none shadow-none">
            <MaterialsTab tutorId={profile.id} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
