
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Profile, ProfileUpdateParams } from "@/hooks/profiles";
import { ProfileAvatar } from "../ProfileAvatar";
import { PersonalInfoForm } from "../PersonalInfoForm";
import { EducationForm } from "../EducationForm";
import { BioForm } from "../BioForm";
import { FormActions } from "../FormActions";
import { useProfileFormState } from "./useProfileFormState";

interface ProfileFormProps {
  profile: Profile;
  updateProfile: (data: ProfileUpdateParams) => Promise<boolean>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, updateProfile }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formState, setFormState, handleInputChange, handleSelectChange, handleBudgetChange, handlePhoneChange, handleAvatarUpdate, resetForm } = useProfileFormState(profile);
  
  // Update form state when profile changes
  useEffect(() => {
    if (profile) {
      resetForm(profile);
    }
  }, [profile, resetForm]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Log the form state before submission for debugging
      console.log("Submitting form state:", formState);
      console.log("Budget being submitted:", formState.budget);
      
      const success = await updateProfile(formState);
      
      if (success) {
        toast({
          title: "Профиль обновлен",
          description: "Данные профиля успешно обновлены",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка сохранения",
          description: "Не удалось обновить профиль. Пожалуйста, попробуйте ещё раз.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось обновить профиль. Пожалуйста, попробуйте ещё раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm(profile);
    
    toast({
      title: "Изменения отменены",
      description: "Форма возвращена к исходному состоянию",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <ProfileAvatar 
              avatarUrl={formState.avatar_url} 
              firstName={formState.first_name} 
              lastName={formState.last_name}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <p className="text-sm text-gray-500 mt-1">Нажмите на аватар для загрузки фото</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <PersonalInfoForm 
              firstName={formState.first_name}
              lastName={formState.last_name}
              city={formState.city}
              phone={formState.phone}
              onInputChange={handleInputChange}
              onPhoneChange={handlePhoneChange}
            />
            
            {/* Education Information */}
            <EducationForm 
              educationalLevel={formState.educational_level}
              school={formState.school}
              grade={formState.grade}
              learningGoals={formState.learning_goals}
              budget={formState.budget}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onBudgetChange={handleBudgetChange}
            />
          </div>
          
          {/* Bio */}
          <BioForm 
            bio={formState.bio}
            onInputChange={handleInputChange}
          />
          
          {/* Form Actions */}
          <FormActions 
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </form>
      </CardContent>
    </Card>
  );
};
