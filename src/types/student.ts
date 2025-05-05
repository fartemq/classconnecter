
export interface StudentRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  subject_id: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
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

export interface Student {
  id: string;
  name: string;
  avatar: string | null;
  lastActive: string;
  level: string;
  grade: string | null;
  school: string | null;
  subjects: string[];
  city: string;
  about: string;
  interests: string[];
  status: string;
}
