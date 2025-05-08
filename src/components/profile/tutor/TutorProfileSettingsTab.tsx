
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublishProfileSection } from "./PublishProfileSection";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TutorProfileSettingsTabProps {
  profile: Profile;
}

export const TutorProfileSettingsTab = ({ profile }: TutorProfileSettingsTabProps) => {
  const navigate = useNavigate();
  
  const handleEditProfile = () => {
    navigate("/profile/tutor/complete");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Моя анкета</h1>
        <Button onClick={handleEditProfile} variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Редактировать анкету
        </Button>
      </div>
      
      {/* Профиль репетитора */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Информация об анкете
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Имя</h3>
              <p className="text-lg">{profile.first_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Фамилия</h3>
              <p className="text-lg">{profile.last_name || "Не указана"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Город</h3>
              <p className="text-lg">{profile.city || "Не указан"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Телефон</h3>
              <p className="text-lg">{profile.phone || "Не указан"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">О себе</h3>
            <p className="text-lg">{profile.bio || "Нет информации"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Секция публикации профиля */}
      <PublishProfileSection 
        tutorId={profile.id} 
        isPublished={false}
        onPublishStatusChange={() => {}}
      />
    </div>
  );
};
