
import React, { useState, useEffect } from "react";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { Profile } from "@/hooks/useProfile";
import { fetchTutorProfile, saveTutorProfile } from "@/services/tutorProfileService";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { TutorAboutForm } from "./forms/TutorAboutForm";

interface TutorAboutTabProps {
  profile: Profile;
}

export const TutorAboutTab = ({ profile }: TutorAboutTabProps) => {
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Загрузка данных профиля репетитора
  useEffect(() => {
    const loadTutorProfile = async () => {
      try {
        setLoadingProfile(true);
        console.log("Loading tutor profile for:", profile.id);
        const data = await fetchTutorProfile(profile.id);
        
        if (data) {
          console.log("Tutor profile loaded:", data);
          setTutorProfile(data);
        } else {
          console.log("No tutor profile data returned");
        }
      } catch (error) {
        console.error("Error loading tutor profile:", error);
        toast({
          title: "Ошибка загрузки профиля",
          description: "Не удалось загрузить данные профиля репетитора",
          variant: "destructive",
        });
      } finally {
        setLoadingProfile(false);
      }
    };
    
    if (profile) {
      loadTutorProfile();
    }
  }, [profile]);

  const getInitialFormValues = (): TutorFormValues => {
    return {
      firstName: tutorProfile?.firstName || profile.first_name || "",
      lastName: tutorProfile?.lastName || profile.last_name || "",
      bio: tutorProfile?.bio || profile.bio || "",
      city: tutorProfile?.city || profile.city || "",
      educationInstitution: tutorProfile?.educationInstitution || "",
      degree: tutorProfile?.degree || "",
      graduationYear: tutorProfile?.graduationYear || new Date().getFullYear(),
      methodology: tutorProfile?.methodology || "",
      experience: tutorProfile?.experience || 0,
      achievements: tutorProfile?.achievements || "",
      videoUrl: tutorProfile?.videoUrl || "",
      avatarUrl: tutorProfile?.avatarUrl || profile.avatar_url || null,
      hourlyRate: 0, // Default value
      subjects: [],  // Default value
      teachingLevels: [], // Default value
    };
  };

  const handleFormSubmit = async (values: TutorFormValues, avatarFile: File | null, avatarUrl: string | null) => {
    try {
      console.log("Submitting form with values:", values);
      console.log("Avatar file:", avatarFile ? "Present" : "Not present");
      console.log("Avatar URL:", avatarUrl);
      
      const result = await saveTutorProfile(values, profile.id, avatarFile, avatarUrl);
      
      if (result.success) {
        console.log("Profile updated successfully:", result);
        toast({
          title: "Профиль обновлен",
          description: "Данные профиля успешно сохранены",
        });
        
        // Обновляем локальные данные
        setTutorProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            firstName: values.firstName,
            lastName: values.lastName,
            bio: values.bio,
            city: values.city,
            educationInstitution: values.educationInstitution || "",
            degree: values.degree || "",
            graduationYear: values.graduationYear || new Date().getFullYear(),
            methodology: values.methodology || "",
            experience: values.experience || 0,
            achievements: values.achievements || "",
            videoUrl: values.videoUrl || "",
            avatarUrl: result.avatarUrl || prev?.avatarUrl,
          };
        });
      } else {
        console.error("Failed to save profile:", result);
        throw new Error("Не удалось сохранить профиль");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      throw error;
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">О себе</h2>
      
      <TutorAboutForm
        initialData={getInitialFormValues()}
        tutorProfile={tutorProfile}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
