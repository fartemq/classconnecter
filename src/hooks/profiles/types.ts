
// Basic profile interface
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  phone: string | null;
  role: 'student' | 'tutor' | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Student specific fields
  grade?: string;
  school?: string;
  educational_level?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_format?: string[];
  budget?: number;
  
  // Tutor specific fields
  education_institution?: string;
  degree?: string;
  graduation_year?: number;
  experience?: number;
  methodology?: string;
  achievements?: string;
  video_url?: string;
  education_verified?: boolean;
  is_published?: boolean;
}

export interface ProfileUpdateParams {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  city?: string;
  phone?: string;
  bio?: string;
  educational_level?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_format?: string[];
  grade?: string;
  school?: string;
  budget?: number;
  
  // Tutor specific fields
  education_institution?: string;
  degree?: string;
  graduation_year?: number;
  experience?: number;
  methodology?: string;
  achievements?: string;
  video_url?: string;
}

// Profile completion step interface
export interface ProfileCompletionStep {
  id: string;
  title: string;
  isCompleted: boolean;
  route: string;
}
