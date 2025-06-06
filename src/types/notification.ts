
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
  read_at?: string;
}
