
import { TutorProfile } from "@/types/tutor";
import { Profile } from "@/hooks/profiles/types";

/**
 * Converts a Profile object to TutorProfile format
 */
export const convertProfileToTutorProfile = (profile: Profile): TutorProfile => {
  return {
    id: profile.id,
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    bio: profile.bio || "",
    city: profile.city || "",
    avatarUrl: profile.avatar_url || undefined,
    subjects: [], // This would need to be populated from a separate fetch
    educationInstitution: profile.education_institution || undefined,
    degree: profile.degree || undefined,
    graduationYear: profile.graduation_year || undefined,
    experience: profile.experience || undefined,
    methodology: profile.methodology || undefined,
    achievements: profile.achievements || undefined,
    videoUrl: profile.video_url || undefined,
    educationVerified: profile.education_verified || false,
    isPublished: profile.is_published || false
  };
};

/**
 * Converts a TutorProfile object to Profile format for components that expect Profile
 */
export const convertTutorProfileToProfile = (tutorProfile: TutorProfile): Profile => {
  return {
    id: tutorProfile.id,
    first_name: tutorProfile.firstName,
    last_name: tutorProfile.lastName,
    bio: tutorProfile.bio,
    city: tutorProfile.city,
    avatar_url: tutorProfile.avatarUrl || null,
    phone: null, // We don't have this in TutorProfile
    role: "tutor", // Default role
    education_institution: tutorProfile.educationInstitution,
    degree: tutorProfile.degree,
    graduation_year: tutorProfile.graduationYear,
    experience: tutorProfile.experience,
    methodology: tutorProfile.methodology,
    achievements: tutorProfile.achievements,
    video_url: tutorProfile.videoUrl,
    education_verified: tutorProfile.educationVerified,
    is_published: tutorProfile.isPublished,
    created_at: null, // Adding missing fields
    updated_at: null  // Adding missing fields
  };
};
