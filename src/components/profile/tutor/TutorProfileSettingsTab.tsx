
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublishProfileSection } from "./PublishProfileSection";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Edit, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TutorPublishController } from "./TutorPublishController";

interface TutorProfileSettingsTabProps {
  profile: Profile;
}

export const TutorProfileSettingsTab = ({ profile }: TutorProfileSettingsTabProps) => {
  const navigate = useNavigate();
  const { isPublished, isLoading, togglePublishStatus, profileStatus } = useTutorPublishStatus();
  
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
      
      {/* Publishing Status Alert */}
      {isPublished ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Ваша анкета опубликована</AlertTitle>
          <AlertDescription className="text-green-700">
            Студенты могут найти вас в поиске и просматривать ваш профиль.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle>Ваша анкета не опубликована</AlertTitle>
          <AlertDescription>
            Для отображения в поиске студентов опубликуйте анкету в разделе "Публикация профиля" ниже.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Профиль репетитора */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Информация об анкете
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 mr-6">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={`${profile.first_name} ${profile.last_name}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <User className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.first_name} {profile.last_name || ""}</h2>
              <p className="text-gray-500">{profile.city || "Город не указан"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
          
          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Образование</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Учебное заведение:</strong> {profile.education_institution || "Не указано"}</p>
              <p><strong>Специальность:</strong> {profile.degree || "Не указана"}</p>
              <p><strong>Год окончания:</strong> {profile.graduation_year || "Не указан"}</p>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Опыт преподавания</h3>
            <p>{profile.experience ? `${profile.experience} лет` : "Опыт работы не указан"}</p>
            <h3 className="text-sm font-medium text-gray-500 mt-3 mb-2">Методика преподавания</h3>
            <p>{profile.methodology || "Не указана"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Секция публикации профиля */}
      <TutorPublishController 
        tutorId={profile.id} 
        isPublished={isPublished}
        onPublishStatusChange={togglePublishStatus}
      />
    </div>
  );
};
