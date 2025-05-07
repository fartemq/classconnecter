import React, { useState, useEffect } from "react";
import { Profile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublishProfileSection } from "./PublishProfileSection";
import { fetchTutorProfile } from "@/services/tutorProfileService";
import { Loader } from "@/components/ui/loader";

interface TutorSettingsTabProps {
  profile: Profile;
}

export const TutorSettingsTab = ({ profile }: TutorSettingsTabProps) => {
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем информацию о публикации профиля
  useEffect(() => {
    const loadTutorProfile = async () => {
      try {
        setIsLoading(true);
        const tutorProfile = await fetchTutorProfile(profile.id);
        setIsPublished(tutorProfile.isPublished || false);
      } catch (error) {
        console.error("Error loading tutor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTutorProfile();
  }, [profile.id]);

  const handlePublishStatusChange = (newStatus: boolean) => {
    setIsPublished(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Настройки профиля</h1>

      {/* Секция публикации профиля */}
      <PublishProfileSection 
        tutorId={profile.id} 
        isPublished={isPublished}
        onPublishStatusChange={handlePublishStatusChange}
      />

      {/* Другие секции настроек (будут добавлены позже) */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки уведомлений</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Настройки уведомлений будут доступны в ближайшее время.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Приватность и безопасность</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Настройки приватности и безопасности будут доступны в ближайшее время.</p>
        </CardContent>
      </Card>
    </div>
  );
};
