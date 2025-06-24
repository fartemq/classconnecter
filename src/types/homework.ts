
export interface HomeworkData {
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description: string;
  file_path?: string | null;
  due_date: string;
  status?: string;
  materials?: string[];
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
  answer?: string | null;
  answer_file_path?: string | null;
  materials?: string[];
  answer_files?: string[];
  subject?: {
    name: string;
    id?: string;
  };
  tutor?: {
    first_name: string;
    last_name: string | null;
    id?: string;
  };
  student?: {
    first_name: string;
    last_name: string | null;
    id?: string;
  };
}

export interface HomeworkFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
}
