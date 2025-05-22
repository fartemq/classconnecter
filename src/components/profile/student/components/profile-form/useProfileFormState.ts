
import { useState, useCallback } from "react";
import { Profile, ProfileUpdateParams } from "@/hooks/profiles";

export const useProfileFormState = (initialProfile: Profile) => {
  const [formState, setFormState] = useState<ProfileUpdateParams>({
    avatar_url: initialProfile?.avatar_url || null,
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
    bio: initialProfile?.bio || "",
    city: initialProfile?.city || "",
    phone: initialProfile?.phone || "",
    educational_level: initialProfile?.educational_level || "school",
    school: initialProfile?.school || "",
    grade: initialProfile?.grade || "",
    subjects: initialProfile?.subjects || [],
    learning_goals: initialProfile?.learning_goals || "",
    preferred_format: initialProfile?.preferred_format || [],
    budget: initialProfile?.budget || 1000,
  });
  
  const resetForm = useCallback((profile: Profile) => {
    console.log("Resetting form with profile data:", profile);
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
  }, []);
  
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

  return {
    formState,
    setFormState,
    handleInputChange,
    handleSelectChange,
    handleBudgetChange,
    handlePhoneChange,
    handleAvatarUpdate,
    resetForm
  };
};
