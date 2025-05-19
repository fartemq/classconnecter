
import { ProfileUpdateParams } from "./types";
import { useStudentProfile } from "./useStudentProfile";
import { useTutorProfile } from "./useTutorProfile";
import { useProfileCommon } from "./useProfileCommon";

/**
 * Main profile hook that uses the appropriate specialized hook based on role
 */
export const useProfile = (requiredRole?: string) => {
  // Use the appropriate specialized hook based on the required role
  if (requiredRole === 'student') {
    return useStudentProfile();
  } 
  
  if (requiredRole === 'tutor') {
    return useTutorProfile();
  }

  // For general use or when role is unknown, use the common hook
  const { profile, isLoading, error, userRole } = useProfileCommon();
  
  // General update profile function that dispatches to the appropriate specialized function
  const updateProfile = async (params: ProfileUpdateParams): Promise<boolean> => {
    if (userRole === 'student') {
      const studentProfile = useStudentProfile();
      return studentProfile.updateProfile(params);
    } else if (userRole === 'tutor') {
      const tutorProfile = useTutorProfile();
      return tutorProfile.updateProfile(params);
    } else {
      console.error("Unknown user role:", userRole);
      return false;
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    error
  };
};
