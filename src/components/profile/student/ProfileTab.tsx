
import React, { useState } from "react";
import { useStudentProfile } from "@/hooks/profiles/student";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { ProfileForm } from "./components/profile-form";
import { StudentProfileWizard } from "./StudentProfileWizard";
import { Button } from "@/components/ui/button";
import { Edit, Settings } from "lucide-react";

export const ProfileTab: React.FC = () => {
  const { profile, updateProfile, isLoading } = useStudentProfile();
  const [showWizard, setShowWizard] = useState(false);
  
  // Check if profile is incomplete
  const isProfileIncomplete = profile && (
    !profile.first_name || 
    !profile.last_name || 
    !profile.city || 
    !profile.bio ||
    !profile.student_profiles?.educational_level ||
    !profile.student_profiles?.subjects?.length
  );
  
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

  // Show wizard if user wants to use it or profile is incomplete
  if (showWizard || isProfileIncomplete) {
    return (
      <div className="space-y-6">
        {!isProfileIncomplete && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Мастер создания профиля</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowWizard(false)}
            >
              Обычная форма
            </Button>
          </div>
        )}
        <StudentProfileWizard />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Edit className="w-6 h-6" />
          Моя анкета
        </h2>
        <Button 
          variant="outline" 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Мастер создания
        </Button>
      </div>
      
      <ProfileForm 
        profile={profile} 
        updateProfile={updateProfile} 
      />
    </div>
  );
};
