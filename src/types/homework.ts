
export interface Homework {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description: string;
  file_path: string | null;
  due_date: string;
  created_at: string;
  updated_at: string;
  status: 'assigned' | 'submitted' | 'graded';
  answer: string | null;
  answer_file_path: string | null;
  grade: number | null;
  feedback: string | null;
  subject?: {
    id: string;
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

export interface HomeworkData {
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description: string;
  file_path?: string | null;
  due_date: string;
  status: 'assigned' | 'submitted' | 'graded';
  answer?: string | null;
  answer_file_path?: string | null;
  grade?: number | null;
  feedback?: string | null;
}
