
export interface Notification {
  id: string;
  user_id: string;
  type: 'lesson_request' | 'lesson_confirmed' | 'lesson_rejected' | 'lesson_cancelled' | 'lesson_reminder' | 'profile_update';
  title: string;
  message: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
  read_at: string | null;
}
