
import { ProfileUpdateParams } from '../types';

export interface StudentProfileUpdateParams extends ProfileUpdateParams {
  school?: string;
  grade?: string;
  educational_level?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_format?: string[];
  budget?: number;
}

export interface UseStudentProfileResult {
  profile: import('../types').Profile | null;
  isLoading: boolean;
  updateProfile: (params: StudentProfileUpdateParams) => Promise<boolean>;
  loadStudentData: (userId: string) => Promise<any>;
  error: string | null;
}
