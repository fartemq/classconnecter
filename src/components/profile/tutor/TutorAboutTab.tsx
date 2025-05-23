
import React, { useState, useEffect } from "react";
import { Profile } from "@/hooks/profiles/types";
import { TutorAboutForm } from "./TutorAboutForm";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { useTutorProfile } from "@/hooks/profiles/useTutorProfile";
import { convertProfileToTutorProfile } from "@/utils/tutorProfileConverters";
import { Loader } from "@/components/ui/loader";
import { fetchTutorProfile } from "@/services/tutor/profile/fetchProfile";

interface TutorAboutTabProps {
  profile: Profile;
}

export const TutorAboutTab = ({ profile }: TutorAboutTabProps) => {
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateProfile } = useTutorProfile();

  useEffect(() => {
    const loadTutorProfile = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTutorProfile(profile.id);
        setTutorProfile(data || convertProfileToTutorProfile(profile));
      } catch (error) {
        console.error("Error loading tutor profile:", error);
        setTutorProfile(convertProfileToTutorProfile(profile));
      } finally {
        setIsLoading(false);
      }
    };

    if (profile?.id) {
      loadTutorProfile();
    }
  }, [profile]);

  const handleSubmit = async (values: TutorFormValues, avatarFile: File | null, avatarUrl: string | null) => {
    const updateParams = {
      first_name: values.firstName,
      last_name: values.lastName,
      bio: values.bio,
      city: values.city,
      avatar_url: avatarUrl,
      education_institution: values.educationInstitution,
      degree: values.degree,
      graduation_year: values.graduationYear,
      experience: values.experience,
      methodology: values.methodology,
      achievements: values.achievements,
      video_url: values.videoUrl,
    };

    await updateProfile(updateParams);
  };

  const initialData: TutorFormValues = {
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    bio: profile.bio || "",
    city: profile.city || "",
    hourlyRate: 0,
    subjects: [],
    teachingLevels: [],
    avatarUrl: profile.avatar_url || "",
    educationInstitution: profile.education_institution || "",
    degree: profile.degree || "",
    graduationYear: profile.graduation_year,
    methodology: profile.methodology || "",
    experience: profile.experience || 0,
    achievements: profile.achievements || "",
    videoUrl: profile.video_url || "",
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
      <h2 className="text-2xl font-semibold mb-6">Информация о профиле</h2>
      <TutorAboutForm
        initialData={initialData}
        tutorProfile={tutorProfile}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
