
// Types for the student_profiles table
export interface StudentProfileDB {
  id: string;
  educational_level?: string | null;
  subjects?: string[] | null;
  learning_goals?: string | null;
  preferred_format?: string[] | null;
  school?: string | null;
  grade?: string | null;
  budget?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Type for updating a student profile
export interface StudentProfileUpdate {
  id: string;
  educational_level?: string | null;
  subjects?: string[] | null;
  learning_goals?: string | null;
  preferred_format?: string[] | null;
  school?: string | null;
  grade?: string | null;
  budget?: number | null;
}

// Type for student profile display
export interface StudentProfileDisplay {
  id: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  educational_level: string | null;
  subjects: string[] | null;
  learning_goals: string | null;
  preferred_format: string[] | null;
  school: string | null;
  grade: string | null;
  avatar_url: string | null;
}
