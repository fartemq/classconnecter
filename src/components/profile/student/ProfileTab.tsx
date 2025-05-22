
import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { ProfileForm } from "./components/profile-form";

export const ProfileTab: React.FC = () => {
  const { profile, updateProfile, isLoading } = useProfile("student");
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-500">
            Информация профиля не найдена
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Пожалуйста, обновите страницу или обратитесь в поддержку
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <ProfileForm 
        profile={profile} 
        updateProfile={updateProfile} 
      />
    </div>
  );
};
