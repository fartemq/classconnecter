
export interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'upcoming';
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
  tutor?: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  tutorName?: string;
}

export interface Tutor {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  name?: string; // Added for compatibility with components expecting name
}

export interface LessonData {
  student_id: string;
  tutor_id: string;
  subject_id: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'upcoming';
}
