
import React, { useState, useEffect } from "react";
import { TutorAboutForm } from "./forms/TutorAboutForm";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { Profile } from "@/hooks/profiles/types";
import { saveTutorProfile } from "@/services/tutor/profile/saveProfile";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth";

interface TutorAboutTabProps {
  profile: Profile;
}

export const TutorAboutTab = ({ profile }: TutorAboutTabProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  
  // Initialize form values with defaults for required TutorFormValues properties
  const getInitialValues = (profile: Profile): TutorFormValues => {
    return {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      bio: profile.bio || "",
      city: profile.city || "",
      avatarUrl: profile.avatar_url || null,
      educationInstitution: profile.education_institution || "",
      degree: profile.degree || "",
      graduationYear: profile.graduation_year || new Date().getFullYear(),
      experience: profile.experience || 0,
      methodology: profile.methodology || "",
      // Required fields that don't exist in Profile type
      hourlyRate: 0,
      subjects: [],
      teachingLevels: [],
      // Access potential extended fields safely
      achievements: (profile as any).achievements || "",
      videoUrl: (profile as any).video_url || "",
    };
  };

  useEffect(() => {
    setTutorProfile({
      id: profile.id,
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      bio: profile.bio || "",
      city: profile.city || "",
      avatarUrl: profile.avatar_url || undefined,
      educationInstitution: profile.education_institution || "",
      degree: profile.degree || "",
      graduationYear: profile.graduation_year || new Date().getFullYear(),
      subjects: [],
      educationVerified: profile.education_verified || false,
      methodology: profile.methodology || "",
      experience: profile.experience || 0,
      // Access these properties safely with type assertion
      achievements: (profile as any).achievements || "",
      videoUrl: (profile as any).video_url || "",
      isPublished: (profile as any).is_published || false
    });
    setIsLoading(false);
  }, [profile]);

  const handleFormSubmit = async (values: TutorFormValues, avatarFile: File | null, avatarUrl: string | null) => {
    if (!user?.id) {
      setError("Необходимо авторизоваться");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Submitting form with values:", values);
      console.log("User ID:", user.id);
      
      const result = await saveTutorProfile(values, user.id, avatarFile, avatarUrl);
      
      if (!result.success) {
        throw new Error(result.error?.message || "Не удалось сохранить профиль");
      }
      
      toast({
        title: "Профиль обновлен",
        description: "Информация успешно сохранена",
      });
    } catch (err) {
      console.error("Error saving profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при сохранении профиля";
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <TutorAboutForm 
        initialData={getInitialValues(profile)} 
        tutorProfile={tutorProfile}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
