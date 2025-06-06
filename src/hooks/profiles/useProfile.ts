
import { useStudentProfile } from './student/useStudentProfile';
import { useTutorProfile } from './useTutorProfile';
import { useAuth } from '@/hooks/auth/useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const studentProfile = useStudentProfile();
  const tutorProfile = useTutorProfile();

  // Determine which profile to use based on user role
  const userRole = user?.user_metadata?.role || 'student';

  if (userRole === 'tutor') {
    return {
      ...tutorProfile,
      updateProfile: async (updates: any) => {
        const result = await tutorProfile.updateProfile(updates);
        return result;
      }
    };
  }

  return {
    ...studentProfile,
    updateProfile: async (updates: any) => {
      const result = await studentProfile.updateProfile(updates);
      return result;
    }
  };
};
