
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
  school?: string | null;
  grade?: string | null;
  // Tutor profile specific fields
  education_institution?: string | null;
  degree?: string | null;
  graduation_year?: number | null;
  experience?: number | null;
  methodology?: string | null;
}
