
import { useStudentProfile } from './student/useStudentProfile';
import { useTutorProfile } from './useTutorProfile';
import { useSimpleAuth } from '@/hooks/auth/SimpleAuthProvider';

export const useProfile = () => {
  const { userRole } = useSimpleAuth();
  const studentProfile = useStudentProfile();
  const tutorProfile = useTutorProfile();

  // Use role from database, not user metadata
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
