
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
import { saveTutorSubjects } from "@/services/tutorSubjectsService";
import { uploadProfileAvatar } from "@/services/avatarService";
import { validateTutorProfile } from "@/services/tutor/validationService";

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
  const [forceWizard, setForceWizard] = useState(false);

  // Check if profile is complete and load full profile data
  const { data: profileCompletion, isLoading: checkingCompletion, refetch } = useQuery({
    queryKey: ['profileCompletion', profile.id],
    queryFn: async () => {
      console.log("Checking profile completion for:", profile.id);
      
      // Get complete profile data with tutor profile joined
      const { data: completeProfile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          tutor_profiles (
            education_institution,
            degree,
            graduation_year,
            methodology,
            experience,
            achievements,
            video_url,
            is_published,
            education_verified
          )
        `)
        .eq('id', profile.id)
        .single();

      if (profileError) {
        console.error("Error fetching complete profile:", profileError);
        throw profileError;
      }

      // Get subjects
      const { data: tutorSubjects, error: subjectsError } = await supabase
        .from('tutor_subjects')
        .select('subject_id, hourly_rate')
        .eq('tutor_id', profile.id)
        .eq('is_active', true);

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
      }

      // Get tutor profile data
      const tutorProfile = Array.isArray(completeProfile.tutor_profiles) 
        ? completeProfile.tutor_profiles[0] 
        : completeProfile.tutor_profiles;

      // Prepare data for validation
      const profileForValidation = {
        id: completeProfile.id,
        first_name: completeProfile.first_name,
        last_name: completeProfile.last_name,
        bio: completeProfile.bio,
        city: completeProfile.city,
        avatar_url: completeProfile.avatar_url,
        education_institution: tutorProfile?.education_institution,
        degree: tutorProfile?.degree,
        graduation_year: tutorProfile?.graduation_year,
        experience: tutorProfile?.experience,
        methodology: tutorProfile?.methodology,
        achievements: tutorProfile?.achievements,
        video_url: tutorProfile?.video_url,
        is_published: tutorProfile?.is_published || false,
        education_verified: tutorProfile?.education_verified || false,
      };

      // Use validation service to check completeness
      const validationResult = validateTutorProfile(profileForValidation, tutorSubjects);

      console.log("Profile validation result:", validationResult);

      return {
        isComplete: validationResult.isValid,
        completionPercentage: validationResult.completionPercentage,
        missingFields: validationResult.missingFields,
        warnings: validationResult.warnings,
        completeProfile,
        tutorSubjects: tutorSubjects || []
      };
    },
    enabled: !!profile.id
  });

  const handleSubmit = async (values: any, avatarFile: File | null) => {
    try {
      setIsLoading(true);
      console.log("Submitting profile data:", values);
      console.log("Avatar file:", avatarFile);
      
      let finalAvatarUrl = values.avatarUrl;

      // Upload avatar if provided
      if (avatarFile) {
        try {
          const uploadedUrl = await uploadProfileAvatar(avatarFile, profile.id);
          if (uploadedUrl) {
            finalAvatarUrl = uploadedUrl;
            console.log("Avatar uploaded successfully:", uploadedUrl);
          }
        } catch (avatarError) {
          console.error("Avatar upload failed:", avatarError);
          // Continue with profile update even if avatar fails
        }
      }
      
      const updateParams = {
        first_name: values.firstName,
        last_name: values.lastName,
        bio: values.bio,
        city: values.city,
        avatar_url: finalAvatarUrl,
        education_institution: values.educationInstitution,
        degree: values.degree,
        graduation_year: values.graduationYear,
        experience: values.experience,
        methodology: values.methodology,
        achievements: values.achievements,
        video_url: values.videoUrl,
      };

      console.log("Update params:", updateParams);

      const success = await updateProfile(updateParams);
      
      if (!success) {
        throw new Error("Ошибка сохранения профиля");
      }

      // Save subjects if they are provided
      if (values.subjects && values.subjects.length > 0 && values.hourlyRate) {
        console.log("Saving subjects:", values.subjects, "Rate:", values.hourlyRate);
        const subjectsResult = await saveTutorSubjects(profile.id, values.subjects, values.hourlyRate);
        if (!subjectsResult.success) {
          console.error("Error saving subjects:", subjectsResult.error);
          throw new Error("Ошибка сохранения предметов");
        }
      }
      
      // Refresh the completion check
      await refetch();
      
      return {
        success: true,
        avatarUrl: finalAvatarUrl,
        error: null
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
    setForceWizard(true);
  };

  const handleSwitchToDisplay = () => {
    setForceWizard(false);
    refetch();
  };

  const handleWizardComplete = () => {
    console.log("Wizard completed, switching to display view");
    setForceWizard(false);
    refetch();
  };

  if (checkingCompletion) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  // Show wizard if profile is incomplete OR user explicitly wants wizard mode
  const shouldShowWizard = forceWizard || !profileCompletion?.isComplete;

  if (shouldShowWizard) {
    const completeProfile = profileCompletion?.completeProfile;
    const tutorProfile = completeProfile?.tutor_profiles;
    const tutorData = Array.isArray(tutorProfile) ? tutorProfile[0] : tutorProfile;
    const tutorSubjects = profileCompletion?.tutorSubjects || [];

    const initialValues = {
      firstName: completeProfile?.first_name || "",
      lastName: completeProfile?.last_name || "",
      bio: completeProfile?.bio || "",
      city: completeProfile?.city || "",
      avatarUrl: completeProfile?.avatar_url || "",
      educationInstitution: tutorData?.education_institution || "",
      degree: tutorData?.degree || "",
      graduationYear: tutorData?.graduation_year || new Date().getFullYear(),
      methodology: tutorData?.methodology || "",
      experience: tutorData?.experience || 0,
      achievements: tutorData?.achievements || "",
      videoUrl: tutorData?.video_url || "",
      subjects: tutorSubjects.map((s: any) => s.subject_id) || [],
      teachingLevels: ["школьник", "студент", "взрослый"] as string[],
      hourlyRate: tutorSubjects[0]?.hourly_rate || 1000,
    };

    console.log("Initial values for wizard:", initialValues);

    return (
      <div className="space-y-4">
        {profileCompletion?.isComplete && forceWizard && (
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
        {!profileCompletion?.isComplete && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              <strong>Профиль не готов к публикации:</strong> {profileCompletion?.completionPercentage || 0}% заполнен
            </p>
            {profileCompletion?.missingFields && profileCompletion.missingFields.length > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                Необходимо заполнить: {profileCompletion.missingFields.join(', ')}
              </p>
            )}
          </div>
        )}
        <TutorProfileWizard
          initialValues={initialValues}
          onSubmit={handleSubmit}
          subjects={subjects}
          isLoading={isLoading}
          onComplete={handleWizardComplete}
        />
      </div>
    );
  }

  // If profile is complete, show beautiful display view
  return (
    <ProfileDisplayView 
      profile={profileCompletion.completeProfile}
      subjects={subjects}
      onUpdate={handleUpdate}
      onSwitchToWizard={handleSwitchToWizard}
    />
  );
};
