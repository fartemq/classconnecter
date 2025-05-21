
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Profile, ProfileUpdateParams } from "@/hooks/profiles";
import { ProfileAvatar } from "./ProfileAvatar";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { EducationForm } from "./EducationForm";
import { BioForm } from "./BioForm";
import { FormActions } from "./FormActions";

interface ProfileInfoProps {
  profile: Profile;
  updateProfile: (data: ProfileUpdateParams) => Promise<boolean>;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, updateProfile }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    avatar_url: profile?.avatar_url || null,
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    bio: profile?.bio || "",
    city: profile?.city || "",
    phone: profile?.phone || "",
    educational_level: profile?.educational_level || "school",
    school: profile?.school || "",
    grade: profile?.grade || "",
    subjects: profile?.subjects || [],
    learning_goals: profile?.learning_goals || "",
    preferred_format: profile?.preferred_format || [],
    budget: profile?.budget || 1000,
  });
  
  // Update form state when profile changes
  useEffect(() => {
    if (profile) {
      console.log("Updating form state with profile data:", profile);
      setFormState({
        avatar_url: profile.avatar_url || null,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        phone: profile.phone || "",
        educational_level: profile.educational_level || "school",
        school: profile.school || "",
        grade: profile.grade || "",
        subjects: profile.subjects || [],
        learning_goals: profile.learning_goals || "",
        preferred_format: profile.preferred_format || [],
        budget: profile.budget || 1000,
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Changing ${name} to ${value}`);
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleBudgetChange = (value: number[]) => {
    if (value && value.length > 0) {
      console.log("Budget changed to:", value[0]);
      setFormState((prev) => ({
        ...prev,
        budget: value[0],
      }));
    }
  };
  
  const handlePhoneChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      phone: value,
    }));
  };
  
  const handleAvatarUpdate = (newUrl: string) => {
    setFormState((prev) => ({
      ...prev,
      avatar_url: newUrl,
    }));
    
    console.log("Avatar URL updated:", newUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    
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
    // Reset form to original profile data
    if (profile) {
      setFormState({
        avatar_url: profile.avatar_url || null,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        phone: profile.phone || "",
        educational_level: profile.educational_level || "school",
        school: profile.school || "",
        grade: profile.grade || "",
        subjects: profile.subjects || [],
        learning_goals: profile.learning_goals || "",
        preferred_format: profile.preferred_format || [],
        budget: profile.budget || 1000,
      });
    }
    
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
