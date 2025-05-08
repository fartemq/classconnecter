
export interface HomeworkData {
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description: string;
  file_path: string | null;
  due_date: string;
  status?: string;
}

export interface Homework {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  file_path: string | null;
  due_date: string | null;
  status: string;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  subject?: {
    name: string;
  };
  tutor?: {
    first_name: string;
    last_name: string | null;
  };
  student?: {
    first_name: string;
    last_name: string | null;
  };
}
