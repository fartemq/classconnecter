
export interface LessonRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string | null;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  message: string | null;
  status: 'pending' | 'time_slots_proposed' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  tutor_response: string | null;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
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
    avatar_url: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export interface CreateLessonRequestData {
  tutor_id: string;
  subject_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  message?: string;
}

export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
}
