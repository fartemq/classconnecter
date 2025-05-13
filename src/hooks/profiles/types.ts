
// Type definitions for profile data
export interface Profile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  role: string;
  
  // Student profile specific fields
  school?: string | null;
  grade?: string | null;
  educational_level?: string | null;
  subjects?: string[] | null;
  learning_goals?: string | null;
  preferred_format?: string[] | null;
  budget?: number | null;
  
  // Tutor profile specific fields
  education_institution?: string | null;
  degree?: string | null;
  graduation_year?: number | null;
  experience?: number | null;
  methodology?: string | null;
  achievements?: string | null;
  video_url?: string | null;
}
