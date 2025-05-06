
export interface Lesson {
  id: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string | null;
  };
  subject: {
    name: string;
  };
  date: string;
  time: string;
  duration: number;
  status: "upcoming" | "completed";
  created_at?: string;
  updated_at?: string;
}

export interface LessonData {
  student_id: string;
  tutor_id: string;
  subject_id: string;
  date: string;
  time: string;
  duration: number;
  status: "upcoming" | "completed";
}
