
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

// Add the reverse conversion function
export const convertTutorProfileToProfile = (tutorProfile: TutorProfile): Profile => {
  return {
    id: tutorProfile.id,
    first_name: tutorProfile.firstName || null,
    last_name: tutorProfile.lastName || null,
    bio: tutorProfile.bio || null,
    avatar_url: tutorProfile.avatarUrl || null,
    city: tutorProfile.city || null,
    phone: null, // Not usually part of tutor profile
    role: 'tutor',
    created_at: null, // TutorProfile doesn't have this info
    updated_at: null, // TutorProfile doesn't have this info
    
    // Tutor specific fields
    education_institution: tutorProfile.educationInstitution || undefined,
    degree: tutorProfile.degree || undefined,
    graduation_year: tutorProfile.graduationYear || undefined,
    experience: tutorProfile.experience || undefined,
    methodology: tutorProfile.methodology || undefined,
    achievements: tutorProfile.achievements || undefined,
    video_url: tutorProfile.videoUrl || undefined,
    education_verified: tutorProfile.educationVerified || undefined,
    is_published: tutorProfile.isPublished || undefined
  };
};
