
export interface Student {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  name?: string; // Added for compatibility with some components
  subjects?: string[]; // Added for compatibility with some components
  avatar?: string; // Added for compatibility
  lastActive?: string; // Added for compatibility
  level?: string; // Added for compatibility
  grade?: string | null; // Added for compatibility
  about?: string; // Added for compatibility
  interests?: string[]; // Added for compatibility
  status?: string; // Added for compatibility
  school?: string | null; // Added for compatibility
  student_profiles?: {
    educational_level: string | null;
    subjects: string[] | null;
    learning_goals: string | null;
    preferred_format: string[] | null;
    school: string | null;
    grade: string | null;
    budget: number | null;
  } | null;
}

export interface TutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id?: string | null; // Made optional to match usage patterns
  message?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at?: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    city: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export interface StudentRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string | null;
  message: string | null; // Required based on error
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    city: string | null;
  } | { id: any; first_name: any; last_name: any; avatar_url: any; city: any; }; // Добавляем альтернативный тип для совместимости
  subject?: {
    id: string;
    name: string;
  } | { id: any; name: any; }; // Добавляем альтернативный тип для совместимости
}
