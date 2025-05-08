
export interface Student {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  student_profiles?: {
    educational_level: string | null;
    subjects: string[] | null;
    learning_goals: string | null;
    preferred_format: string[] | null;
    school: string | null;
    grade: string | null;
    budget: number | null;
  };
}

export interface TutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  tutor?: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
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
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  student?: {
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
