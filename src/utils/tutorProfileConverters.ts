
import { Profile } from "@/hooks/profiles/types";
import { TutorProfile } from "@/types/tutor";

export const convertProfileToTutorProfile = (profile: Profile): TutorProfile => {
  return {
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    bio: profile.bio || '',
    city: profile.city || '',
    avatarUrl: profile.avatar_url,
    educationInstitution: profile.education_institution || '',
    degree: profile.degree || '',
    graduationYear: profile.graduation_year || undefined,
    subjects: [], // Initialize with empty array, to be filled separately
    methodology: profile.methodology || '',
    experience: profile.experience || 0,
    achievements: (profile as any).achievements || '',
    videoUrl: (profile as any).video_url || '',
    isPublished: (profile as any).is_published || false,
    educationVerified: (profile as any).education_verified || false
  };
};
