
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TutorAboutTab } from "./TutorAboutTab";
import { SubjectsTab } from "./SubjectsTab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchTutorProfile } from "@/services/tutorProfileService"; 
import { TutorProfile } from "@/types/tutor";
import { Loader } from "@/components/ui/loader";
import { TutorPublishController } from "./TutorPublishController";
import { useAuth } from "@/hooks/auth";
import { Profile } from "@/hooks/profiles/types";
import { Button } from "@/components/ui/button";
import { TutorProfilePreviewModal } from "./preview/TutorProfilePreviewModal";
import { Eye } from "lucide-react";
import { convertProfileToTutorProfile } from "@/utils/tutorProfileConverters";

interface TutorProfileSettingsTabProps {
  profile: Profile;
}

export const TutorProfileSettingsTab = ({ profile }: TutorProfileSettingsTabProps) => {
  const { user } = useAuth();
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const handlePreviewClick = () => {
    // If we don't have tutorProfile yet, try to create one from profile data
    if (!tutorProfile && profile) {
      const convertedProfile = convertProfileToTutorProfile(profile);
      setTutorProfile(convertedProfile);
    }
    
    setPreviewOpen(true);
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
        <Button 
          variant="outline" 
          onClick={handlePreviewClick}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          Предпросмотр
        </Button>
      </div>

      {/* Preview Modal */}
      <TutorProfilePreviewModal 
        tutorProfile={tutorProfile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {/* Publication status section */}
      <TutorPublishController 
        tutorId={profile.id}
        isPublished={isPublished}
        onPublishStatusChange={handlePublishStatusChange}
      />
      
      {/* Combined profile content */}
      <Card className="overflow-hidden border rounded-lg shadow-sm p-6">
        <div className="space-y-10">
          {/* Personal info section */}
          <section>
            <h2 className="text-xl font-semibold mb-6">Информация о преподавателе</h2>
            <TutorAboutTab profile={profile} />
          </section>
          
          <hr className="border-t border-gray-200" />
          
          {/* Subjects section */}
          <section className="pt-4">
            <h2 className="text-xl font-semibold mb-6">Предметы и цены</h2>
            <SubjectsTab tutorId={profile.id} />
          </section>
        </div>
      </Card>
    </div>
  );
};
