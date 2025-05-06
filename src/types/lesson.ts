
export interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  created_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
  tutor?: {
    id: string;
    first_name: string;
    last_name: string | null;
  };
  subject: {
    id: string;
    name: string;
  };
}

export interface LessonData {
  tutor_id: string;
  student_id: string;
  subject_id: string;
  date: string;
  time: string;
  duration: number;
  status?: string;
}
