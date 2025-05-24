
import React, { useState, useEffect } from "react";
import { TutorProfile } from "@/types/tutor";
import { TutorProfileWizard } from "../TutorProfileWizard";
import { TutorProfileSettingsTab } from "../TutorProfileSettingsTab";
import { Profile } from "@/hooks/profiles/types";
import { useTutorProfile } from "@/hooks/profiles/useTutorProfile";
import { convertProfileToTutorProfile } from "@/utils/tutorProfileConverters";
import { Loader } from "@/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCompletionCheckerProps {
  profile: Profile;
  subjects: any[];
}

export const ProfileCompletionChecker: React.FC<ProfileCompletionCheckerProps> = ({
  profile,
  subjects
}) => {
  const { updateProfile } = useTutorProfile();
  const [isLoading, setIsLoading] = useState(false);

  // Check if profile is complete
  const { data: profileCompletion, isLoading: checkingCompletion } = useQuery({
    queryKey: ['profileCompletion', profile.id],
    queryFn: async () => {
      // Check if basic profile fields are filled
      const hasBasicInfo = !!(
        profile.first_name && 
        profile.last_name && 
        profile.city && 
        profile.bio
      );

      // Check if tutor-specific fields are filled
      const { data: tutorData } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('id', profile.id)
        .maybeSingle();

      const hasTutorInfo = !!(
        tutorData?.education_institution && 
        tutorData?.methodology && 
        tutorData?.experience !== null
      );

      // Check if subjects are added
      const { count: subjectsCount } = await supabase
        .from('tutor_subjects')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', profile.id)
        .eq('is_active', true);

      const hasSubjects = (subjectsCount || 0) > 0;

      return {
        isComplete: hasBasicInfo && hasTutorInfo && hasSubjects,
        hasBasicInfo,
        hasTutorInfo,
        hasSubjects
      };
    },
    enabled: !!profile.id
  });

  const handleSubmit = async (values: any, avatarFile: File | null) => {
    try {
      setIsLoading(true);
      
      const updateParams = {
        first_name: values.firstName,
        last_name: values.lastName,
        bio: values.bio,
        city: values.city,
        avatar_url: values.avatarUrl,
        education_institution: values.educationInstitution,
        degree: values.degree,
        graduation_year: values.graduationYear,
        experience: values.experience,
        methodology: values.methodology,
        achievements: values.achievements,
        video_url: values.videoUrl,
      };

      const success = await updateProfile(updateParams);
      
      return {
        success,
        avatarUrl: values.avatarUrl,
        error: success ? null : "Ошибка сохранения"
      };
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      return {
        success: false,
        avatarUrl: null,
        error: error instanceof Error ? error.message : "Произошла ошибка"
      };
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingCompletion) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  // If profile is not complete, show wizard
  if (!profileCompletion?.isComplete) {
    const initialValues = {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      bio: profile.bio || "",
      city: profile.city || "",
      avatarUrl: profile.avatar_url || "",
      // Add default values for other fields to prevent form errors
      hourlyRate: 1000,
      subjects: [],
      teachingLevels: ["школьник", "студент", "взрослый"] as const,
      educationInstitution: "",
      degree: "",
      graduationYear: new Date().getFullYear(),
      methodology: "",
      experience: 0,
      achievements: "",
      videoUrl: "",
    };

    return (
      <TutorProfileWizard
        initialValues={initialValues}
        onSubmit={handleSubmit}
        subjects={subjects}
        isLoading={isLoading}
      />
    );
  }

  // If profile is complete, show normal settings
  return <TutorProfileSettingsTab profile={profile} />;
};
