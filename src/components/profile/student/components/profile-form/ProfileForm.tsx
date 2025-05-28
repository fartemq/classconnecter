
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { PersonalInfoForm } from "../PersonalInfoForm";
import { EducationForm } from "../EducationForm";
import { BioForm } from "../BioForm";
import { ProfileAvatar } from "../ProfileAvatar";

interface ProfileFormProps {
  profile: any;
  updateProfile: (data: any) => Promise<boolean>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, updateProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    city: profile?.city || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    educational_level: profile?.student_profiles?.educational_level || '',
    school: profile?.student_profiles?.school || '',
    grade: profile?.student_profiles?.grade || '',
    subjects: profile?.student_profiles?.subjects || [],
    preferred_format: profile?.student_profiles?.preferred_format || [],
    learning_goals: profile?.student_profiles?.learning_goals || '',
    budget: profile?.student_profiles?.budget || 1000
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting profile data:", formData);
      const success = await updateProfile(formData);
      
      if (success) {
        toast({
          title: "Профиль обновлен",
          description: "Ваши данные успешно сохранены"
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <ProfileAvatar
          avatarUrl={formData.avatar_url}
          firstName={formData.first_name}
          onAvatarChange={(url) => handleInputChange('avatar_url', url)}
        />
      </div>

      <PersonalInfoForm
        data={formData}
        onChange={handleInputChange}
      />

      <EducationForm
        data={formData}
        onChange={handleInputChange}
      />

      <BioForm
        data={formData}
        onChange={handleInputChange}
      />

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading && <Loader size="sm" className="mr-2" />}
          Сохранить изменения
        </Button>
      </div>
    </form>
  );
};
