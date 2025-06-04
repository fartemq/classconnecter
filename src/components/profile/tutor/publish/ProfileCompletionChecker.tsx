
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
import { ProfileDisplayView } from "../display/ProfileDisplayView";

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
  const [showWizard, setShowWizard] = useState(false);

  // Check if profile is complete
  const { data: profileCompletion, isLoading: checkingCompletion, refetch } = useQuery({
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
      
      if (success) {
        // Refresh the completion check
        refetch();
        setShowWizard(false);
      }
      
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

  const handleUpdate = () => {
    refetch();
  };

  const handleSwitchToWizard = () => {
    setShowWizard(true);
  };

  const handleSwitchToDisplay = () => {
    setShowWizard(false);
    refetch();
  };

  if (checkingCompletion) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  // If profile is not complete OR user wants to use wizard, show wizard
  if (!profileCompletion?.isComplete || showWizard) {
    const initialValues = {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      bio: profile.bio || "",
      city: profile.city || "",
      avatarUrl: profile.avatar_url || "",
      // Add default values for other fields to prevent form errors
      hourlyRate: 1000,
      subjects: profile.subjects || [],
      teachingLevels: ["школьник", "студент", "взрослый"] as string[],
      educationInstitution: profile.education_institution || "",
      degree: profile.degree || "",
      graduationYear: profile.graduation_year || new Date().getFullYear(),
      methodology: profile.methodology || "",
      experience: profile.experience || 0,
      achievements: profile.achievements || "",
      videoUrl: profile.video_url || "",
    };

    return (
      <div className="space-y-4">
        {profileCompletion?.isComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Вы находитесь в режиме полного редактирования анкеты. 
              После сохранения вы вернетесь к обычному просмотру профиля.
            </p>
            <button 
              onClick={handleSwitchToDisplay}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Вернуться к просмотру профиля
            </button>
          </div>
        )}
        <TutorProfileWizard
          initialValues={initialValues}
          onSubmit={handleSubmit}
          subjects={subjects}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // If profile is complete, show beautiful display view
  return (
    <ProfileDisplayView 
      profile={profile}
      subjects={subjects}
      onUpdate={handleUpdate}
      onSwitchToWizard={handleSwitchToWizard}
    />
  );
};
